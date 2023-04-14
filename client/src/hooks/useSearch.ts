import {
  filter,
  switchMap,
  catchError,
  debounceTime,
  distinctUntilChanged,
} from "rxjs/operators";
import { IDBPDatabase, openDB } from "idb";
import { useEffect, useState, useRef } from "react";
import { BehaviorSubject, from, merge, of } from "rxjs";

import { useSubscription } from "./useSubscribtion";

export interface QueryMatch {
  excerpt: string;
  match: string;
  weight: number;
}

export interface SearchState {
  matches: QueryMatch[];
  loading: boolean;
  error?: string;
  noResults?: boolean;
  noMoreResults?: boolean;
}

let db: IDBPDatabase;
let mounted = false;

async function initDb() {
  return await openDB("searchDatabase", 3, {
    upgrade(db) {
      db.createObjectStore("results");
      db.createObjectStore("queries");
    },
  });
}

async function handleSearch(term: string, page: number): Promise<SearchState> {
  if (!db) {
    db = await initDb();
  }

  const cacheKey = `${term}-${page}`;

  const cachedMatches: QueryMatch[] = await db.get("results", cacheKey);
  if (cachedMatches) {
    console.log("Cache hit");
    return { matches: cachedMatches, loading: false };
  }

  const response = await fetch(`/search?q=${term}&page=${page}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
  });

  if (response.ok) {
    const data: QueryMatch[] = await response.json();

    db.put("results", data, cacheKey).catch((e) => {
      console.error("Error caching", e);
    });

    console.log("Cache miss");

    return {
      matches: data,
      loading: false,
      noResults: data.length === 0,
    };
  }

  console.log("Error", response.status, response.statusText);

  return response.json().then((data) => ({
    matches: [],
    loading: false,
    error: data.error,
  }));
}

const searchSubject = new BehaviorSubject<{ term: string; page: number }>({
  term: "",
  page: 1,
});

const observable$ = searchSubject.pipe(
  distinctUntilChanged(), // only emit if value is different from previous value
  filter(({ term }) => term.length >= 3), // only emit if value is at least 3 characters
  debounceTime(200), // only emit value after 400ms pause in events
  switchMap(({ term, page }) =>
    merge(
      of({ loading: true, error: "", noResults: false }),
      from(handleSearch(term.trim(), page))
    )
  ),
  catchError(async (e) => ({
    loading: false,
    error: "An application error occured",
  })) // catch any errors and return a new observable
);

export function useSearch() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const loadingRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<SearchState>({
    matches: [],
    loading: false,
    error: "",
    noResults: false,
    noMoreResults: false,
  });
  const [savedQueries, setSavedQueries] = useState<Map<string, string>>(
    new Map()
  );

  function handleSetQuery(query: string) {
    setQuery(query);
    searchSubject.next({ term: query, page: 1 });
  }

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newQuery = event.target.value;
    setQuery(newQuery);
    searchSubject.next({ term: newQuery, page: 1 });
  }

  function handleSaveQuery(query: string) {
    setSavedQueries((prevState) => {
      const newMap = new Map(prevState);

      if (prevState.has(query)) {
        newMap.delete(query);
        return newMap;
      }

      newMap.set(query, query);
      return newMap;
    });
  }

  useSubscription<any>(
    observable$,
    (newState) => {
      if (newState.matches && page > 1) {
        newState.matches = [...state.matches, ...newState.matches];
      }
      setState({ ...state, ...newState });
    },
    (e) => console.error(e)
  );

  useEffect(() => {
    let observer: IntersectionObserver;

    if (!mounted) {
      mounted = true;

      async function init() {
        db = await initDb();

        console.log("Initialized db");

        const savedQueries = await db.get("queries", "queries");
        if (savedQueries) {
          console.log("Loaded saved queries");

          setSavedQueries(savedQueries);
        }
      }

      init();

      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            console.log("Loading more results");

            setPage((prevPage) => prevPage + 1);
            searchSubject.next({ term: query, page: page + 1 });
          }
        },
        { threshold: 1 }
      );

      if (loadingRef.current) {
        observer.observe(loadingRef.current);
      }
    }

    return () => {
      db &&
        db.put("queries", savedQueries, "queries").catch((e) => {
          console.error("Error caching", e);
        });

      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, []);

  return {
    state,
    query,
    loadingRef,
    savedQueries,
    handleSetQuery,
    handleSearchChange,
    handleSaveQuery,
  };
}
