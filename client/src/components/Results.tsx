import { Key } from "react";
import { useTransition, a, useTrail } from "@react-spring/web";

import { SearchState } from "../hooks/useSearch";

type Status = "loading" | "error" | "success";

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

const Result: React.FC<{ excerpt: string; match: string; style: any }> = ({
  excerpt,
  match,
  style,
}) => (
  <a.li
    style={style}
    className="card bg-neutral p-4 text-neutral-content shadow-xl"
  >
    {getHighlightedText(excerpt, match)}
  </a.li>
);

export const Results: React.FC<SearchState> = ({
  matches,
  loading,
  error,
  noResults,
}) => {
  const status: Status = loading ? "loading" : error ? "error" : "success";

  const trail = useTrail(matches.length, {
    from: { opacity: 0, transform: "translate3d(0, 40px, 0)" },
    to: { opacity: 1, transform: "translate3d(0, 0px, 0)" },
  });

  const Content = {
    loading: (
      <div className="flex h-14 w-14 animate-spin items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500">
        <div className="h-9 w-9 rounded-full bg-base-100"></div>
      </div>
    ),
    error: <div>{error}</div>,
    success: noResults ? (
      <div> No results for this search </div>
    ) : (
      <ul className="grid grid-cols-[repeat(auto-fit,_minmax(380px,_1fr))] gap-6">
        {trail.map((style, index) => (
          <Result
            key={matches[index].excerpt}
            style={style}
            match={matches[index].match}
            excerpt={matches[index].excerpt}
          />
        ))}
      </ul>
    ),
  };

  return (
    <div className="grid h-full w-full flex-1 place-items-center">
      {Content[status]}
    </div>
  );
};
