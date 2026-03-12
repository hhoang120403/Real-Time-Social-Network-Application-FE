import { useCallback, useEffect, type RefObject } from 'react';

const useInfiniteScroll = (
  bodyRef: RefObject<HTMLDivElement | null>,
  bottomLineRef: RefObject<HTMLDivElement | null>,
  callback: () => void
) => {
  const handleScroll = useCallback(() => {
    const bodyElement = bodyRef.current;
    const bottomElement = bottomLineRef.current;
    if (!bodyElement || !bottomElement) return;

    const containerHeight = bodyElement.getBoundingClientRect().height;
    const { top: bottomLineTop } = bottomElement.getBoundingClientRect();

    if (bottomLineTop <= containerHeight) {
      callback();
    }
  }, [bodyRef, bottomLineRef, callback]);

  useEffect(() => {
    const bodyElement = bodyRef.current;
    if (!bodyElement) return;

    bodyElement.addEventListener('scroll', handleScroll, true);

    return () => {
      bodyElement.removeEventListener('scroll', handleScroll, true);
    };
  }, [handleScroll, bodyRef]);
};

export default useInfiniteScroll;
