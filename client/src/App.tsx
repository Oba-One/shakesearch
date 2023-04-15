import { Chips } from "./components/Chips";
import { AppBar } from "./components/AppBar";
import { Search } from "./components/Search";
import { Results } from "./components/Results";
import { Queries } from "./components/Queries";

import { useSearch } from "./hooks/useSearch";

const App: React.FC = () => {
  const {
    query,
    state,
    savedQueries,
    handleReset,
    handleSearchChange,
    handleSetQuery,
    handleSaveQuery,
    handleLoadMoreResults,
  } = useSearch();

  return (
    <>
      <AppBar />
      <main className="drawer drawer-end">
        <input id="queries-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex w-full flex-1 flex-col gap-4 px-4 py-6">
          <Search
            value={query}
            searches={savedQueries}
            onFavoriteClick={handleSaveQuery}
            onChange={handleSearchChange}
          />
          <Chips onChipClick={handleSetQuery} onClearClick={handleReset} />
          <Results {...state} loadMoreResults={handleLoadMoreResults} />
        </div>
        <div className="drawer-side">
          <Queries queries={savedQueries} onQueryClick={handleSetQuery} />
        </div>
      </main>
    </>
  );
};

export default App;
