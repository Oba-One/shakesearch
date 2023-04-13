import { useEffect } from "react";
import { Observable } from "rxjs";

export function useSubscription<T>(
  source$: Observable<T>,
  nextHandler: (value: T) => void,
  errorHandler: (error: any) => void
) {
  useEffect(() => {
    const subscription = source$.subscribe({
      next: nextHandler,
      error: errorHandler,
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [source$]);
}
