import { Key } from "react";
import { a } from "@react-spring/web";

export function getHighlightedText(text: string, highlight: string) {
  const parts = text.split(new RegExp(`(${highlight})`, "gi"));
  return (
    <p className='antialiased tracking-wide'>
      {parts.map((part: string, i: Key | null | undefined) => (
        <span
          key={i}
          className={`${ part.toLowerCase() === highlight.toLowerCase() ? "bg-yellow-300 font-semibold" : "" }`}
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
  onCardClick: ({ excerpt, match }: { excerpt: string; match: string }) => void;
}> = ({ excerpt, match, style, onCardClick }) => (
  <a.li style={style}>
    <label
      htmlFor="result-dialog"
      className="card px-4 !py-3 text-black shadow-lg font-light cursor-pointer"
      onClick={() => onCardClick({ excerpt, match })}
    >
      {getHighlightedText(excerpt, match)}
    </label>
  </a.li>
);
