import { useEffect, useRef } from 'react';

const useChatScrollToBottom = (messages: any[], trigger?: any) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const previousMessageCount = useRef(0);
  const isNearBottom = useRef(true);
  const shouldStickToBottom = useRef(true);

  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior
      });
    }
  };

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const updateNearBottom = () => {
      const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
      // High threshold (500px) to ensure we almost always stick to bottom when new stuff arrives
      isNearBottom.current = distanceFromBottom < 500;
      shouldStickToBottom.current = isNearBottom.current;
    };

    updateNearBottom();
    element.addEventListener('scroll', updateNearBottom, { passive: true });
    return () => element.removeEventListener('scroll', updateNearBottom);
  }, []);

  useEffect(() => {
    const messageCount = Array.isArray(messages) ? messages.length : 0;
    const isFirstLoad = previousMessageCount.current === 0;
    const hasNewMessage = messageCount > previousMessageCount.current;
    
    // Always force scroll to bottom on:
    // 1. Initial page load
    // 2. A new message arrives AND we were relatively close to the bottom
    // 3. The length changed significantly (likely a conversation switch)
    const shouldScroll = isFirstLoad || (hasNewMessage && isNearBottom.current) || (messageCount < previousMessageCount.current) || (trigger !== undefined);

    previousMessageCount.current = messageCount;

    if (shouldScroll) {
      shouldStickToBottom.current = true;
      scrollToBottom();
      
      // Multiple frames to catch different stages of layout/image start
      window.requestAnimationFrame(() => scrollToBottom());
      setTimeout(() => scrollToBottom(), 50);
      setTimeout(() => scrollToBottom(), 200);
      setTimeout(() => scrollToBottom(), 500);
    }

    // ResizeObserver on the content wrapper (first child)
    let resizeObserver: ResizeObserver | undefined;
    if (scrollRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        if (shouldStickToBottom.current) {
          scrollToBottom('auto');
        }
      });

      const contentWrapper = scrollRef.current.firstElementChild;
      if (contentWrapper) {
          resizeObserver.observe(contentWrapper);
      } else {
          resizeObserver.observe(scrollRef.current);
      }
    }

    // MutationObserver to catch added IMGs and attach load listeners
    let mutationObserver: MutationObserver | undefined;
    if (scrollRef.current) {
        mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node instanceof HTMLElement) {
                        const imgs = node.querySelectorAll('img');
                        imgs.forEach(img => {
                            if (!img.complete) {
                                img.addEventListener('load', () => {
                                    if (shouldStickToBottom.current) {
                                      scrollToBottom('auto');
                                      setTimeout(() => scrollToBottom('auto'), 50);
                                    }
                                }, { once: true });
                            } else {
                                // Already cached
                                if (shouldStickToBottom.current) scrollToBottom('auto');
                            }
                        });
                    }
                });
            });
        });
        mutationObserver.observe(scrollRef.current, { childList: true, subtree: true });
    }

    return () => {
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [messages, trigger]);

  return scrollRef;
};

export default useChatScrollToBottom;
