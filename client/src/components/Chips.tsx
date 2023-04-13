const defaultChips = [
  "Hamlet",
  "Macbeth",
  "Romeo and Juliet",
  "A horse! a horse!",
  "If music be the food of love, play on.",
  "To be, or not to be: that is the question",
];

export const Chips: React.FC<{
  chips?: string[];
  onChipClick: (chip: string) => void;
}> = ({ chips = defaultChips, onChipClick }) => {
  return (
    <ul className="flex w-full gap-2">
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
          onClick={() => onChipClick("")}
         htmlFor="my-drawer-4" className="drawer-button badge py-3"
        >
          Saved
        </label>
      </div>
    </ul>
  );
};
