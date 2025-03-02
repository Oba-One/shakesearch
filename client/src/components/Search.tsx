import { DetailedHTMLProps, InputHTMLAttributes } from "react";

interface SearchProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  onFavoriteClick: (value: string) => void;
  searches: Map<string, string>;
  value: string;
}

export const Search: React.FC<SearchProps> = ({
  onFavoriteClick,
  searches,
  value,
  ...props
}) => {
  const favorited = value ? searches.has(value) : false;

  return (
    <div className="flex flex-nowrap gap-4">
      <input
        {...props}
        value={value}
        placeholder="Thou shall search..."
        className="input-bordered input-primary input flex-1  shrink border-2"
      />
      <label
        className="swap swap-rotate"
        onClick={() => onFavoriteClick(value)}
      >
        <svg
          className={`${!favorited ? "swap-on" : ""} h-10 w-10 fill-primary`}
          height="24"
          width="24"
          viewBox="0 96 960 960"
        >
          <path d="m480 936-58-52q-101-91-167-157T150 608.5Q111 556 95.5 512T80 422q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810 608.5Q771 661 705 727T538 884l-58 52Z" />
        </svg>
        <svg
          className={`${favorited ? "swap-on" : ""} h-10 w-10 fill-primary`}
          height="24"
          width="24"
          viewBox="0 96 960 960"
        >
          <path d="m480 936-58-52q-101-91-167-157T150 608.5Q111 556 95.5 512T80 422q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810 608.5Q771 661 705 727T538 884l-58 52Zm0-108q96-86 158-147.5t98-107q36-45.5 50-81t14-70.5q0-60-40-100t-100-40q-47 0-87 26.5T518 376h-76q-15-41-55-67.5T300 282q-60 0-100 40t-40 100q0 35 14 70.5t50 81q36 45.5 98 107T480 828Zm0-273Z" />
        </svg>
      </label>
    </div>
  );
};
