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
    <div className="flex flex-col lg:flex-row items-center md:flex-nowrap lg:justify-between gap-4 ">
      <ul className="flex flex-1 nowrap gap-2">
        {chips.map((chip) => (
          <li
            key={chip}
            onClick={() => onChipClick(chip)}
            className="badge badge-lg cursor-pointer text-black px-4 line-clamp-1 font-medium shrink opacity-80 transfrom-opacity duration-300 ease-in-out hover:opacity-100"
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
          className="btn btn-sm btn-outline btn-secondary "
        >
          Clear
        </label>
        <label
          key="saved"
          role="listitem"
          htmlFor="queries-drawer"
          className="btn btn-sm btn-accent drawer-button "
        >
          Saved
        </label>
      </div>
    </div>
  );
};
