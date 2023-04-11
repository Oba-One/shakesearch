import { useEffect } from "react";

import viteLogo from "/vite.svg";

import { Chips } from "./components/Chips";
import { Search } from "./components/Search";
import { Results } from "./components/Results";
import { useSearch } from "./hooks/useSearch";
import { themeChange } from "theme-change";

function App() {
  const { searchRef, state, handleSearchChange, handleSetQuery } = useSearch();

  useEffect(() => {
    themeChange(false);
  }, []);

  return (
    <>
      <header className="">
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <div>
          <button
            data-toggle-theme="dark,light"
            data-act-class="ACTIVECLASS"
            className="btn"
          >
            Toggle
          </button>
        </div>
      </header>
      <main className="flex flex-col gap-2">
        <Search
          ref={searchRef}
          onSearchChange={handleSearchChange}
          loading={state.loading}
        />
        <Chips onChipClick={handleSetQuery} />
        <Results {...state} />
      </main>
    </>
  );
}

export default App;
