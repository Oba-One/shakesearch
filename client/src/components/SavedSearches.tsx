import { a, useTrail } from "@react-spring/web";

interface SavedSearchesProps {
  searches: Map<string, string>;
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

export const SavedSearches: React.FC<SavedSearchesProps> = ({
  searches,
  onQueryClick,
}) => {
  const list = [...searches.values()];

  const trail = useTrail(list.length, {
    from: { opacity: 0, transform: "translate3d(0, 40px, 0)" },
    to: { opacity: 1, transform: "translate3d(0, 0px, 0)" },
  });

  return (
    <div className="drawer-side flex flex-col gap-4 px-4">
      <h2 className="text-2xl font-bold">Saved Searches</h2>
      <div className="flex-1">
        {list.length ? (
          <ul className="flex flex-col gap-6">
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
          <div>No saved searches</div>
        )}
      </div>
    </div>
  );
};
