import {
  map,
  filter,
  switchMap,
  catchError,
  debounceTime,
  distinctUntilChanged,
} from "rxjs/operators";
import { IDBPDatabase, openDB } from "idb";
import { BehaviorSubject, merge, of } from "rxjs";
import { useState, useEffect, useRef } from "react";

async function initDb() {
  return await openDB("searchResultsDb", 1, {
    upgrade(db) {
      db.createObjectStore("searchResults");
    },
  });
}

export function useSearch() {
  const [state, setState] = useState({
    matches: [],
    loading: false,
    error: "",
    noResults: false,
    query: "",
  });
  const searchRef = useRef<HTMLInputElement>(null);
  const [subject] = useState<BehaviorSubject<string>>(new BehaviorSubject(""));

  function handleSetQuery(query: string) {
    if (searchRef.current) {
      searchRef.current.value = query;
    }
  }

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    subject.next(event.target.value.toLocaleLowerCase());
    console.log(event.target.value);
  }

  useEffect(() => {
    let db: IDBPDatabase;

    async function handleSearch(term: string) {
      if (!db) {
        db = await initDb();
      }

      const cachedResults = await db.get("searchResults", term);
      if (cachedResults) {
        return { ...cachedResults, loading: false };
      }

      const response = await fetch(`/search?q=${term}`);

      if (response.ok) {
        const data = await response.json();
        await db.put("searchResults", { data, query: term }, term);

        return {
          data,
          loading: false,
          query: term,
          noResults: data.length === 0,
        };
      }

      return response.json().then((data) => ({
        data: [],
        loading: false,
        query: term,
        error: data.error,
      }));
    }

    const observable = subject
      .pipe(
        map((s) => s.trim()), // remove whitespace
        distinctUntilChanged(), // only emit if value is different from previous value
        filter((s) => s.length >= 3), // only emit if value is at least 3 characters
        debounceTime(200), // only emit value after 200ms pause in events
        switchMap((term) =>
          merge(
            of(
              { loading: true, error: "", noResults: false, query: "" },
              handleSearch(term)
            )
          )
        ), // switch to new inner observable each time the value changes
        catchError(async (e) => ({
          loading: false,
          error: "An application error occured",
        })) // catch any errors and return a new observable
      )
      .subscribe((newState) => {
        setState({ ...state, ...newState });
      });

    return () => {
      observable.unsubscribe();
      subject.unsubscribe();
    };
  }, []);

  return {
    state,
    searchRef,
    handleSetQuery,
    handleSearchChange,
  };
}
