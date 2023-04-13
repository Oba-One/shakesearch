import { useSearch } from "./hooks/useSearch";

import { Chips } from "./components/Chips";
import { AppBar } from "./components/AppBar";
import { Search } from "./components/Search";
import { Results } from "./components/Results";
import { SavedSearches } from "./components/SavedSearches";

function App() {
  const {
    query,
    state,
    savedQueries,
    handleSearchChange,
    handleSetQuery,
    handleSaveQuery,
  } = useSearch();

  return (
    <>
      <AppBar />
      <main className="drawer-content flex w-full flex-1 flex-col gap-4 px-4 py-6">
        <Search
          value={query}
          searches={savedQueries}
          onFavoriteClick={handleSaveQuery}
          onChange={handleSearchChange}
        />
        <Chips onChipClick={handleSetQuery} />
        <Results {...state} />
        {/* <SavedSearches searches={savedQueries} /> */}
      </main>
      <input id="saved-queries-drawer" type="checkbox" className="drawer-toggle" />
    </>
  );
}

export default App;
