import {
  filter,
  switchMap,
  debounceTime,
  distinctUntilChanged,
  catchError,
} from "rxjs/operators";
import { IDBPDatabase, openDB } from "idb";
import { useEffect, useState, useCallback } from "react";
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
  page: number;
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
    return { matches: cachedMatches, loading: false, page };
  }

  const response = await fetch(`/search?q=${term}&page=${page}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
  })

  if (response.ok) {
    const data: QueryMatch[] = await response.json();

    db.put("results", data, cacheKey).catch((e) => {
      console.error("Error caching", e);
    });

    return {
      matches: data,
      loading: false,
      noResults: data.length === 0,
      page: page + 1
    };
  }

  return response.json().then((data) => ({
    matches: [],
    loading: false,
    error: data.error,
    noMoreResults: data.error === "No more results available",
    page
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
      of({ loading: true, error: "", noResults: false, matches: [] }),
      from(handleSearch(term.trim(), page))
    )
  ),
  catchError((e, caught) => {
    console.error(e);
    return caught;
  })
);

export function useSearch() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>({
    matches: [],
    loading: false,
    error: "",
    noResults: false,
    noMoreResults: false,
    page: 1, // Move the page state into the state object
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

  const handleLoadMoreResults = useCallback(() => {
    console.log("Loading more results");
    searchSubject.next({ term: query, page: state.page + 1 });
  }, [query, state.page]); // Update the dependency array

  useSubscription<any>(
    observable$,
    (newState: SearchState) => {
      console.log("State", {
        old: state,
        new: newState,
      });
      
      if (newState.matches && state.page > 1 || (newState.noMoreResults && state.matches.length > 0)) {
        newState.matches = [...state.matches, ...newState.matches];
      }

      setState((prevState) => ({
        ...prevState,
        ...newState,
      }));
    },
    (e) => console.error(e)
  );

  useEffect(() => {
    if (!mounted) {
      mounted = true;

      async function init() {
        db = await initDb();

        const savedQueries: Map<string, string> = await db.get("queries", "queries");
        if (savedQueries) {
          setSavedQueries(new Map(savedQueries));
        }
      }

      init();
    }

    return () => {
      db &&
        db.put("queries", savedQueries, "queries").catch((e) => {
          console.error("Error caching", e);
        })
    };
  }, []);

  return {
    state,
    query,
    savedQueries,
    handleSetQuery,
    handleSearchChange,
    handleSaveQuery,
    handleLoadMoreResults,
  };
}
