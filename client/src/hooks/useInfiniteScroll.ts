// hooks/useInfiniteScroll.ts
import { useCallback, useRef, useEffect } from "react";

const useInfiniteScroll = (callback: () => void) => {
  const observer = useRef<IntersectionObserver | null>(null);

  const setLastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observer.current) observer.current.disconnect();

      if (node) {
        observer.current = new IntersectionObserver(
          (entries) => {
            if (entries[0].intersectionRatio <= 0) return;
            callback();
          },
          { threshold: 1 }
        );

        observer.current.observe(node);
      }
    },
    [callback]
  );

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  return setLastElementRef;
};

export default useInfiniteScroll;
