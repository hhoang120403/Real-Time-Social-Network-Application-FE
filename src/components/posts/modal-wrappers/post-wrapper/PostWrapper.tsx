import { createPortal } from 'react-dom';
import React, { useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { PostUtils } from '@services/utils/post-utils.service';

const PostWrapper = ({ children, loading }: { children: React.ReactNode; loading?: boolean }) => {
  const dispatch = useDispatch();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If loading, absolutely do nothing
      if (loading) return;

      const target = event.target as Node;
      // Check if the click is outside the modal content
      if (modalRef.current && !modalRef.current.contains(target)) {
        PostUtils.closePostModal(dispatch);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dispatch, loading]);

  const childrenArray = React.Children.toArray(children);

  const modalContent = (
    <div
      className="fixed inset-0 z-1050 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto outline-none select-none"
      data-testid="post-modal"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-0 transition-opacity"></div>

      {/* Container for modal boxes */}
      <div className="z-10 w-full flex flex-col items-center justify-center relative pointer-events-none">
        <div ref={modalRef} className="flex flex-col items-center justify-center pointer-events-auto">
          {/* Render all children starting from index 1 if passed as an array, otherwise render all children */}
          {childrenArray.length > 1 ? childrenArray.slice(1) : childrenArray}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PostWrapper;
