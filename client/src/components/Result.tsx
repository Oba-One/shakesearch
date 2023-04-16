import { memo } from "react";
import { a } from "@react-spring/web";
import { areEqual } from "react-window";

export function getHighlightedText(text: string, highlight: string) {
  const parts = text.split(new RegExp(`(${highlight})`, "gi"));
  return (
    <p className="">
      {parts.map((part: string, i: React.Key | null | undefined) => (
        <span
          key={i}
          className={` ${
            part.toLowerCase() === highlight.toLowerCase()
              ? "font-semibold text-error"
              : ""
          }`}
        >
          {part}
        </span>
      ))}
    </p>
  );
}

export const Result: React.FC<{
  excerpt: string;
  match: string;
  style: any;
  onCardClick: (excerpt: string, match: string) => void;
}> = memo(
  ({ excerpt, match, style, onCardClick }) => (
    <a.div style={style} className="p-3">
      <label
        htmlFor="result-dialog"
        className="card line-clamp-5 grid h-full w-full transform transform-gpu cursor-pointer place-items-center rounded-lg border-2 border-secondary p-3 text-sm font-light shadow-xl transition duration-300 hover:scale-105"
        onClick={() => onCardClick(excerpt, match)}
      >
        {getHighlightedText(excerpt, match)}
      </label>
    </a.div>
  ),
  areEqual
);
