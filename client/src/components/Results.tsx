import { useTransition, a } from "@react-spring/web";

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

const Result: React.FC<{ excerpt: string; query: string }> = ({
  excerpt,
  query,
}) => <li>{getHighlightedText(excerpt, query)}</li>;

export const Results: React.FC<{
  matches: string[];
  loading: boolean;
  error: string;
  noResults: boolean;
  query: string;
}> = ({ matches, loading, error, noResults, query }) => {
  const status: Status = loading ? "loading" : error ? "error" : "success";

  const transition = useTransition(status, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  });

  const Content = {
    loading: <div> Loading... </div>,
    error: <div> {error} </div>,
    success: noResults ? (
      <div> No results for this search </div>
    ) : (
      <ul>
        {matches.map((match) => (
          <Result key={match} excerpt={match} query={query} />
        ))}
      </ul>
    ),
  };

  return transition((style, item) => (
    <a.div style={style}>{Content[item]}</a.div>
  ));
};
