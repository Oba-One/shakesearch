import { DetailedHTMLProps, InputHTMLAttributes, forwardRef } from "react";

// type Status = "loading" | "error" | "success";

interface SearchProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
}

export const Search = forwardRef<HTMLInputElement, SearchProps>(
  ({ onSearchChange, value }, ref) => {
    return (
      <input
        value={value}
        onInput={onSearchChange}
        ref={ref}
        placeholder="Thou shall search..."
        className="input-bordered input-ghost input-accent input w-full"
      />
    );
  }
);
