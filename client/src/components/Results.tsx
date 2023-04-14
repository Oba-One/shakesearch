import { Key, useState } from "react";
import { a, useTrail } from "@react-spring/web";

import { SearchState } from "../hooks/useSearch";
import { createPortal } from "react-dom";

interface ResultsProps extends SearchState {
  loadingRef: React.RefObject<HTMLDivElement>;
}

function getHighlightedText(text: string, highlight: string) {
  const parts = text.split(new RegExp(`(${highlight})`, "gi"));
  return (
    <span>
      {parts.map((part: string, i: Key | null | undefined) => (
        <span
          key={i}
          style={
            part.toLowerCase() === highlight.toLowerCase()
              ? { fontWeight: "bold" }
              : {}
          }
        >
          {part}
        </span>
      ))}
    </span>
  );
}

const Loader = () => (
  <div className="flex h-14 w-14 animate-spin items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500">
    <div className="h-9 w-9 rounded-full bg-base-100"></div>
  </div>
);

const ContentWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className="grid h-full w-full place-items-center">{children}</div>;

const Result: React.FC<{
  excerpt: string;
  match: string;
  style: any;
  onCardClick: (excerpt: string) => void;
}> = ({ excerpt, match, style, onCardClick }) => (
  <a.li style={style}>
    <label
      htmlFor="result-dialog"
      className="card bg-neutral p-4 text-neutral-content shadow-xl"
      onClick={() => onCardClick(excerpt)}
    >
      {getHighlightedText(excerpt, match)}
    </label>
  </a.li>
);

export const Results: React.FC<ResultsProps> = ({
  matches,
  loading,
  error,
  noResults,
  noMoreResults,
  loadingRef,
}) => {
  const [dialogData, setDialogData] = useState("");

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
            <div ref={loadingRef} />
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
    <div className="pb- grid h-full w-full flex-1 place-items-center">
      {renderContent()}
      {createPortal(
        <>
          <input type="checkbox" id="result-dialog" className="modal-toggle" />
          <label htmlFor="result-dialog" className="modal cursor-pointer">
            <label className="modal-box relative" htmlFor="">
              {dialogData}
            </label>
          </label>
        </>,
        document.body
      )}
    </div>
  );
};
