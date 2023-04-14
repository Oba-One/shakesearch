import { useState } from "react";
import { createPortal } from "react-dom";
import { useTrail } from "@react-spring/web";

import { SearchState } from "../hooks/useSearch";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

import { Result, getHighlightedText } from "./Result";

interface ResultsProps extends SearchState {
  loadMoreResults: () => void;
}

const Loader = () => (
  <div className="flex h-14 w-14 animate-spin items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500">
    <div className="h-9 w-9 rounded-full bg-base-100"></div>
  </div>
);

const ContentWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className="grid h-full w-full place-items-center">{children}</div>;

export const Results: React.FC<ResultsProps> = ({
  matches,
  loading,
  error,
  noResults,
  noMoreResults,
  loadMoreResults,
}) => {
  const [{ match, excerpt }, setDialogData] = useState({
    excerpt: "",
    match: "",
  });
  const lastResultRef = useInfiniteScroll(loadMoreResults);

  const trail = useTrail(matches.length, {
    from: { opacity: 0, transform: "translate3d(0, 40px, 0)" },
    to: { opacity: 1, transform: "translate3d(0, 0px, 0)" },
  });

  const renderContent = () => {
    if (noResults) {
      return loading ? (
        <Loader />
      ) : error ? (
        error
      ) : (
        "No results for this search"
      );
    }

    return (
      <>
        {matches.length > 0 && (
          <ul className="grid grid-cols-[repeat(auto-fit,_minmax(380px,_1fr))] gap-6 pb-36">
            {trail.map((style, index) => (
              <Result
                key={matches[index].excerpt}
                style={style}
                match={matches[index].match}
                excerpt={matches[index].excerpt}
                onCardClick={setDialogData}
              />
            ))}
            <div ref={lastResultRef} className='invisible'>
              Loading more...
            </div>
          </ul>
        )}
        {loading ? (
          <ContentWrapper>
            <Loader />
          </ContentWrapper>
        ) : error ? (
          <ContentWrapper> error</ContentWrapper>
        ) : noMoreResults ? (
          <ContentWrapper>No more results</ContentWrapper>
        ) : null}
      </>
    );
  };

  return (
    <div className="grid h-full w-full flex-1 place-items-center">
      {renderContent()}
      {createPortal(
        <>
          <input type="checkbox" id="result-dialog" className="modal-toggle" />
          <label htmlFor="result-dialog" className="modal cursor-pointer">
            <label className="modal-box relative text-2xl font-normal" htmlFor="">
              {getHighlightedText(excerpt, match)}
            </label>
          </label>
        </>,
        document.body
      )}
    </div>
  );
};
