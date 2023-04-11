const defaultChips = ["Hamlet", "Macbeth", "Romeo and Juliet"];

export const Chips: React.FC<{
  chips?: string[];
  onChipClick: (chip: string) => void;
}> = ({ chips = defaultChips, onChipClick }) => {
  return (
    <div>
      {chips.map((chip) => (
        <button key={chip} onClick={() => onChipClick(chip)}>
          {chip}
        </button>
      ))}
    </div>
  );
};
