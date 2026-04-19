import { useEffect, type RefObject } from 'react';

const useInfiniteScroll = (
  bottomLineRef: RefObject<HTMLDivElement | null>,
  callback: () => void
) => {
  useEffect(() => {
    const bottomElement = bottomLineRef.current;
    if (!bottomElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      {
        root: null, // Use viewport
        rootMargin: '100px', // Start loading before it's fully visible
        threshold: 0.1
      }
    );

    observer.observe(bottomElement);

    return () => {
      observer.unobserve(bottomElement);
    };
  }, [bottomLineRef, callback]);
};

export default useInfiniteScroll;
