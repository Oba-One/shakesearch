const defaultChips = ["Hamlet", "Macbeth", "Romeo and Juliet"];

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
      <button
        key="clear"
        role="listitem"
        onClick={() => onChipClick("")}
        className="badge ml-auto py-3"
      >
        Clear
      </button>
    </ul>
  );
};
