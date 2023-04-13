import { a, useTrail } from "@react-spring/web";

interface QueriesProps {
  queries: Map<string, string>;
  onQueryClick: (query: string) => void;
}

const Query: React.FC<{
  query: string;
  style: any;
  onQueryClick: (query: string) => void;
}> = ({ query, style, onQueryClick }) => (
  <a.li
    style={style}
    className="card bg-neutral p-4 text-neutral-content shadow-xl"
    onClick={() => onQueryClick(query)}
  >
    {query}
  </a.li>
);

export const Queries: React.FC<QueriesProps> = ({ queries, onQueryClick }) => {
  const list = [...queries.values()];

  const trail = useTrail(list.length, {
    from: { opacity: 0, transform: "translate3d(0, 40px, 0)" },
    to: { opacity: 1, transform: "translate3d(0, 0px, 0)" },
  });

  return (
    <>
      <label htmlFor="queries-drawer" className="drawer-overlay"></label>
      <div className="min-w-md flex flex-col gap-4 bg-base-100">
        <h2 className="text-2xl font-bold">Saved queries</h2>
        <div className="flex-1">
          {list.length ? (
            <ul className="flex flex-col gap-6 pb-36">
              {trail.map((style, index) => (
                <Query
                  key={list[index]}
                  query={list[index]}
                  style={style}
                  onQueryClick={onQueryClick}
                />
              ))}
            </ul>
          ) : (
            <div>No saved queries</div>
          )}
        </div>
      </div>
    </>
  );
};
