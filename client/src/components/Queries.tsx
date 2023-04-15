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
    className="card p-4 line-clamp-4 shadow-xl bg-base-100 cursor-pointer hover:shadow-2xl font-light transition-all duration-300 ease-in-out transform-gpu scale-125 opacity-80 hover:opacity-100 hover:bg-rose-200"
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
      <label htmlFor="queries-drawer" className="drawer-overlay" style={{backgroundColor: `rgba(0,0,0,0.75`}}></label>
      <div className="w-80 px-4 py-6 flex flex-col gap-4 bg-neutral">
        <h2 className="text-3xl tracking-wide text-secondary">Saved Queries</h2>
        <div className="flex-1 pb-36 text-black">
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
            <div className='text-center'>No saved queries</div>
          )}
        </div>
      </div>
    </>
  );
};
