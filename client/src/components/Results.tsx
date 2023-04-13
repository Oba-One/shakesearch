import { Key, useState } from "react";
import { a, useTrail } from "@react-spring/web";

import { SearchState } from "../hooks/useSearch";
import { createPortal } from "react-dom";

interface ResultsProps extends SearchState {
  handleScroll: (event: React.UIEvent<HTMLUListElement, UIEvent>) => void;
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

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid h-full w-full place-items-center">{children}</div>
);

const Result: React.FC<{
  excerpt: string;
  match: string;
  style: any;
  onCardClick: (excerpt: string) => void;
}> = ({ excerpt, match, style, onCardClick }) => (
  <a.li
    style={style}
    className="card transform bg-neutral p-4 text-neutral-content shadow-xl transition duration-300 ease-in-out hover:scale-110"
  >
    <label htmlFor="result-dialog" onClick={() => onCardClick(excerpt)}>
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
  handleScroll,
}) => {
  const [dialogData, setDialogData] = useState("");

  const trail = useTrail(matches.length, {
    from: { opacity: 0, transform: "translate3d(0, 40px, 0)" },
    to: { opacity: 1, transform: "translate3d(0, 0px, 0)" },
  });

  return (
    <div className="pb- grid h-full w-full flex-1 place-items-center">
      {noResults ? (
        <Wrapper>
          {loading ? <Loader /> : error ? error : "No results for this search"}
        </Wrapper>
      ) : (
        <>
          {matches.length > 0 && (
            <ul
              className="grid grid-cols-[repeat(auto-fit,_minmax(380px,_1fr))] gap-6 pb-36"
              onScroll={handleScroll}
            >
              {trail.map((style, index) => (
                <Result
                  key={matches[index].excerpt}
                  style={style}
                  match={matches[index].match}
                  excerpt={matches[index].excerpt}
                  onCardClick={setDialogData}
                />
              ))}
            </ul>
          )}
          {loading ? (
            <Wrapper>
              <Loader />
            </Wrapper>
          ) : error ? (
            <Wrapper> error</Wrapper>
          ) : noMoreResults ? (
            <Wrapper>No more results</Wrapper>
          ) : null}
        </>
      )}
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
