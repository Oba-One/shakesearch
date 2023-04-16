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
    className="card line-clamp-3 transform-gpu cursor-pointer p-4 text-xl  opacity-80 shadow-xl transition-all duration-300 ease-in-out hover:bg-accent hover:opacity-100"
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
      <label
        htmlFor="queries-drawer"
        className="drawer-overlay"
        style={{ backgroundColor: `rgba(0,0,0,0.5` }}
      ></label>
      <div className="flex w-80 flex-col gap-4 bg-base-100 px-4 py-6">
        <h2 className="text-3xl tracking-wide">Saved Queries</h2>
        <div className="flex-1 pb-36">
          {list.length ? (
            <ul className="flex flex-col gap-4">
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
            <div className="text-center">No saved queries, add some!</div>
          )}
        </div>
      </div>
    </>
  );
};
