type Status = "loading" | "error" | "success";

export const Search: React.FC<{
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
  ref: React.RefObject<HTMLInputElement>;
}> = ({ onSearchChange, loading, ref }) => {
  return <input onChange={onSearchChange} ref={ref} />;
};
