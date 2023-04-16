const defaultChips = [
  "Hamlet",
  "Macbeth",
  "A horse! a horse!",
  "To be, or not to be, that is the question",
];

export const Chips: React.FC<{
  chips?: string[];
  onChipClick: (chip: string) => void;
  onClearClick: () => void;
}> = ({ chips = defaultChips, onChipClick, onClearClick }) => {
  return (
    <div className="flex flex-col items-center gap-4 md:flex-nowrap lg:flex-row lg:justify-between ">
      <ul className="nowrap flex flex-1 gap-2">
        {chips.map((chip) => (
          <li
            key={chip}
            onClick={() => onChipClick(chip)}
            className="transfrom-opacity badge badge-secondary badge-lg line-clamp-1 shrink cursor-pointer px-4 font-medium opacity-80 duration-300 ease-in-out hover:opacity-100"
          >
            {chip}
          </li>
        ))}
      </ul>
      <div className=" flex gap-2">
        <label
          key="clear"
          role="listitem"
          onClick={onClearClick}
          className="btn-secondary btn-outline btn-sm btn "
        >
          Clear
        </label>
        <label
          key="saved"
          role="listitem"
          htmlFor="queries-drawer"
          className="btn-accent drawer-button btn-sm btn "
        >
          Saved
        </label>
      </div>
    </div>
  );
};
