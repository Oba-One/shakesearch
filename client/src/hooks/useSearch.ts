import {
  filter,
  switchMap,
  debounceTime,
  distinctUntilChanged,
  catchError,
} from "rxjs/operators";
import { IDBPDatabase, openDB } from "idb";
import { useEffect, useState } from "react";
import { BehaviorSubject, from, merge, of } from "rxjs";

import { useSubscription } from "./useSubscribtion";

import { mathces as mockMatches } from "../../mocks.json";

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
}

const INITIAL_SEARCH_STATE: SearchState = {
  matches: [],
  loading: false,
  error: "",
  noResults: false,
};

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

async function handleSearch(term: string): Promise<SearchState> {
  if (!db) {
    db = await initDb();
  }

  const cacheKey = `${term}`;

  return {
    matches: mockMatches,
    loading: false,
    noResults: mockMatches.length === 0,
  };

  const cachedMatches: QueryMatch[] = await db.get("results", cacheKey);
  if (cachedMatches) {
    return { matches: cachedMatches, loading: false };
  }

  const response = await fetch(`/search?q=${term}`, {
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

    return {
      matches: data,
      loading: false,
      noResults: data.length === 0,
    };
  }

  return response.json().then((data) => ({
    matches: [],
    loading: false,
    error: data.error,
    noResults: data.error === "No results found",
  }));
}

const searchSubject = new BehaviorSubject<string>("");

const observable$ = searchSubject.pipe(
  distinctUntilChanged(), // only emit if value is different from previous value
  filter((term) => term.length >= 3), // only emit if value is at least 3 characters
  debounceTime(400), // only emit value after 400ms pause in events
  switchMap((term) =>
    merge(
      of({ loading: true, error: "", noResults: false, matches: [] }),
      from(handleSearch(term.trim()))
    )
  ),
  catchError((e, caught) => {
    console.error(e, caught);
    return caught;
  })
);

export function useSearch() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>(INITIAL_SEARCH_STATE);
  const [savedQueries, setSavedQueries] = useState<Map<string, string>>(
    new Map()
  );

  function handleSetQuery(query: string) {
    setQuery(query);
    searchSubject.next(query);
  }

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newQuery = event.target.value;
    setQuery(newQuery);
    searchSubject.next(newQuery);
  }

  function handleSaveQuery(query: string) {
    if (!query) return;

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

  function handleReset() {
    setState(INITIAL_SEARCH_STATE);
    setQuery("");
  }

  useSubscription<SearchState>(
    observable$,
    (newState: SearchState) => {
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

        const savedQueries: Map<string, string> = await db.get(
          "queries",
          "queries"
        );
        if (savedQueries) {
          setSavedQueries(new Map(savedQueries));
        }
      }
      init();
    }

    return () => {
      const cleanUp = async () => {
        try {
          db && (await db.put("queries", savedQueries, "queries"));
        } catch (e) {
          console.error("Error caching", e);
        }
      };
      cleanUp();
    };
  }, []);

  return {
    state,
    query,
    savedQueries,
    handleReset,
    handleSetQuery,
    handleSearchChange,
    handleSaveQuery,
  };
}
