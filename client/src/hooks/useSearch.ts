import {
  map,
  filter,
  switchMap,
  catchError,
  debounceTime,
  distinctUntilChanged,
} from "rxjs/operators";
import { useEffect, useState } from "react";
import { IDBPDatabase, openDB } from "idb";
import { BehaviorSubject, from, merge, of } from "rxjs";

import { useSubscription } from "./useSubscribtion";
import { mathces as mockMatcges } from "../../mocks.json";

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

let db: IDBPDatabase;
let mounted = false;

async function initDb() {
  return await openDB("searchDatabase", 2, {
    upgrade(db) {
      db.createObjectStore("searchResults");
      db.createObjectStore("savedQueries");
    },
  });
}

async function handleSearch(term: string): Promise<any> {
  if (!db) {
    db = await initDb();
  }

  const cachedMatches: QueryMatch[] = await db.get("searchResults", term);
  if (cachedMatches) {
    return { matches: cachedMatches, loading: false };
  }

  return {
    matches: mockMatcges,
    loading: false,
    noResults: mockMatcges.length === 0,
  };

  // const response = await fetch(`/search?q=${term}`, {
  //   method: "GET",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   credentials: "same-origin",
  // });

  // if (response.ok) {
  //   const data: QueryMatch[] = await response.json();
  //   await db.put("searchResults", data, term);

  //   return {
  //     matches: data,
  //     loading: false,
  //     noResults: data.length === 0,
  //   };
  // }

  // return response.json().then((data) => ({
  //   matches: [],
  //   loading: false,
  //   error: data.error,
  // }));

  // throw new Error("Not implemented");
}

const searchSubject: BehaviorSubject<string> = new BehaviorSubject("");

const observable$ = searchSubject.pipe(
  map((s) => s.trim()), // remove whitespace
  distinctUntilChanged(), // only emit if value is different from previous value
  filter((s) => s.length >= 3), // only emit if value is at least 3 characters
  debounceTime(400), // only emit value after 200ms pause in events
  switchMap((term) =>
    merge(
      of({ loading: true, error: "", noResults: false }),
      from(handleSearch(term))
    )
  ), // switch to new inner observable each time the value changes
  catchError(async (e) => ({
    loading: false,
    error: "An application error occured",
  })) // catch any errors and return a new observable
);

export function useSearch() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>({
    matches: [],
    loading: false,
    error: "",
    noResults: false,
  });
  const [savedQueries, setSavedQueries] = useState<Map<string, string>>(
    new Map()
  );

  function handleSetQuery(query: string) {
    setQuery(query);
    searchSubject.next(query);
  }

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
    searchSubject.next(event.target.value);
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
      console.log("new state", newState);

      setState({ ...state, ...newState });
    },
    (e) => console.error(e)
  );

  useEffect(() => {
    if (!mounted) {
      mounted = true;

      async function init() {
        db = await initDb();
        const savedQueries = await db.get("savedQueries", "savedQueries");
        if (savedQueries) {
          setSavedQueries(savedQueries);
        }
      }

      init();
    }

    return () => {
      db && db.put("savedQueries", savedQueries, "savedQueries");
      searchSubject.unsubscribe();
    };
  }, []);

  return {
    state,
    query,
    savedQueries,
    handleSetQuery,
    handleSearchChange,
    handleSaveQuery,
  };
}
