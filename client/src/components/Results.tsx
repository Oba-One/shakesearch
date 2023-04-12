import { useTransition, a, useTrail } from "@react-spring/web";

type Status = "loading" | "error" | "success";

function getHighlightedText(text: string, highlight: string) {
  const parts = text.split(new RegExp(`(${highlight})`, "gi"));
  return (
    <span>
      {parts.map((part: string, i: React.Key | null | undefined) => (
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

const Result: React.FC<{ excerpt: string; query: string; style: any }> = ({
  excerpt,
  query,
  style,
}) => <a.li style={style}>{getHighlightedText(excerpt, query)}</a.li>;

export const Results: React.FC<{
  matches: string[];
  loading: boolean;
  error: string;
  noResults: boolean;
}> = ({ matches, loading, error, noResults }) => {
  const status: Status = loading ? "loading" : error ? "error" : "success";

  const transition = useTransition(status, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  const trail = useTrail(matches.length, {
    from: { opacity: 0, transform: "translate3d(0, 40px, 0)" },
    to: { opacity: 1, transform: "translate3d(0, 0px, 0)" },
  });

  const Content = {
    loading: <div> Loading... </div>,
    error: <div> {error} </div>,
    success: noResults ? (
      <div> No results for this search </div>
    ) : (
      <ul className="grid h-full w-full grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))]">
        {trail.map((style, index) => (
          <Result
            key={matches[index]}
            style={style}
            excerpt={matches[index]}
            query=""
          />
        ))}
      </ul>
    ),
  };

  return transition((style, item) => (
    <a.div className="grid w-full flex-1 place-items-center" style={style}>
      {Content[item]}
    </a.div>
  ));
};
