import { Key } from "react";
import { a } from "@react-spring/web";

export function getHighlightedText(text: string, highlight: string) {
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

export const Result: React.FC<{
  excerpt: string;
  match: string;
  style: any;
  onCardClick: ({ excerpt, match }: { excerpt: string; match: string }) => void;
}> = ({ excerpt, match, style, onCardClick }) => (
  <a.li style={style}>
    <label
      htmlFor="result-dialog"
      className="card bg-neutral p-4 text-neutral-content shadow-xl"
      onClick={() => onCardClick({ excerpt, match })}
    >
      {getHighlightedText(excerpt, match)}
    </label>
  </a.li>
);
