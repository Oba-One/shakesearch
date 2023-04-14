const defaultChips = [
  "Hamlet",
  "Macbeth",
  "Romeo and Juliet",
  "A horse! a horse!",
  "To be, or not to be, that is the question",
];

export const Chips: React.FC<{
  chips?: string[];
  onChipClick: (chip: string) => void;
}> = ({ chips = defaultChips, onChipClick }) => {
  return (
    <div className="flex flex-nowrap gap-4 sm:flex-col">
      <ul className="flex w-full flex-1 gap-2">
        {chips.map((chip) => (
          <button
            role="listitem"
            key={chip}
            onClick={() => onChipClick(chip)}
            className="badge py-3"
          >
            {chip}
          </button>
        ))}
      </ul>
      <div className="ml-auto flex gap-2">
        <label
          key="clear"
          role="listitem"
          onClick={() => onChipClick("")}
          className="badge py-3"
        >
          Clear
        </label>
        <label
          key="saved"
          role="listitem"
          htmlFor="queries-drawer"
          className="badge drawer-button py-3"
        >
          Saved
        </label>
      </div>
    </div>
  );
};
