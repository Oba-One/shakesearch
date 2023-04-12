import shakespeareHead from "/vite.svg";

import { useTheme } from "./hooks/useTheme";
import { useSearch } from "./hooks/useSearch";

import { Chips } from "./components/Chips";
import { Search } from "./components/Search";
import { Results } from "./components/Results";

function App() {
  const { toggleTheme } = useTheme();
  const { searchRef, state, handleSearchChange, handleSetQuery } = useSearch();

  return (
    <>
      <header className="navbar bg-primary">
        <div className="navbar-start flex gap-1">
          <a
            href="https://www.shakespeare.org.uk/explore-shakespeare/shakespedia/william-shakespeare/william-shakespeare-biography"
            target="_blank"
          >
            <img
              src={shakespeareHead}
              className="logo"
              alt="Shaking Shakespeare"
            />
          </a>
          <h1 className="">Search</h1>
        </div>
        <div className="navbar-end">
          <button onClick={toggleTheme} className="btn">
            Theme
          </button>
        </div>
      </header>
      <main className="flex flex-col gap-4 px-4 py-6">
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
