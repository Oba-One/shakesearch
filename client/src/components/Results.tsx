import Modal from "react-modal";
import { useState } from "react";
import { FixedSizeGrid } from "react-window";
import { useTrail } from "@react-spring/web";
import Autosizer from "react-virtualized-auto-sizer";

import { SearchState } from "../hooks/useSearch";
import { useMediaQuery } from "../hooks/useMediaQuery";

import { Result, getHighlightedText } from "./Result";

interface ResultsProps extends SearchState {}

const getIdByGridPosition = (col: number, row: number, numCols: number) =>
  row * numCols + col;

const ContentWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="grid h-full w-full place-items-center">{children}</div>
);

const Loader = () => (
  <ContentWrapper>
    <div className="flex h-14 w-14 animate-spin items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500">
      <div className="h-9 w-9 rounded-full bg-base-100"></div>
    </div>
  </ContentWrapper>
);

export const Results: React.FC<ResultsProps> = ({
  matches,
  loading,
  error,
  noResults,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [{ match, excerpt }, setDialogData] = useState({
    excerpt: "",
    match: "",
  });

  const S = useMediaQuery("(min-width:380px)");
  const M = useMediaQuery("(min-width:900px)");
  const L = useMediaQuery("(min-width:1280px)");

  const grid = {
    cols: 0,
  };

  if (L) {
    grid.cols = 3;
  } else if (M) {
    grid.cols = 2;
  } else if (S) {
    grid.cols = 1;
  } else {
    grid.cols = 1;
  }

  const trail = useTrail(matches.length, {
    from: { opacity: 0, transform: "translate3d(0, 32px, 0)" },
    to: { opacity: 1, transform: "translate3d(0, 0px, 0)" },
  });

  function handleCardClick(excerpt: string, match: string) {
    setDialogData({ match, excerpt });
    setDialogOpen(true);
  }

  function handleClose() {
    setDialogOpen(false);
    setDialogData({ match: "", excerpt: "" });
  }

  const renderItem = ({
    columnIndex,
    rowIndex,
    style,
  }: {
    columnIndex: number;
    rowIndex: number;
    style: any;
  }) => {
    const index = getIdByGridPosition(columnIndex, rowIndex, grid.cols);

    if (!matches[index]) {
      return null;
    }

    const { match, excerpt } = matches[index];

    return (
      <Result
        key={excerpt}
        style={{ ...style, ...trail[index] }}
        match={match}
        excerpt={excerpt}
        onCardClick={handleCardClick}
      />
    );
  };

  const renderContent = () => {
    if (loading) return <Loader />;
    if (error) return <ContentWrapper>{error}</ContentWrapper>;
    if (noResults) return <ContentWrapper>No results found</ContentWrapper>;

    return (
      <Autosizer>
        {({ height, width }) => (
          <FixedSizeGrid
            // className="list grid grid-cols-[repeat(auto-fit,_minmax(380px,_1fr))] gap-6 pb-36"
            height={height ?? 400}
            width={width ?? window.innerWidth}
            columnCount={grid.cols}
            columnWidth={(width ?? 0) / grid.cols}
            rowCount={Math.ceil(matches.length / grid.cols)}
            rowHeight={300}
            overscanRowCount={20}
            style={{ paddingBottom: "160px" }}
          >
            {renderItem}
          </FixedSizeGrid>
        )}
      </Autosizer>
    );
  };

  return (
    <div className="flex-1">
      <Modal
        isOpen={dialogOpen}
        onRequestClose={handleClose}
        ariaHideApp={false}
      >
        <div className="text-xl tracking-wide">
          {getHighlightedText(excerpt, match)}
        </div>
      </Modal>
      {renderContent()}
    </div>
  );
};
