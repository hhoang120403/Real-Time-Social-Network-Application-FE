import { createPortal } from 'react-dom';
import React, { useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import useDetectOutsideClick from '@hooks/useDetectOutsideClick';
import { PostUtils } from '@services/utils/post-utils.service';

const PostWrapper = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const modalRef = useRef<HTMLDivElement>(null);
  const [isActive] = useDetectOutsideClick(modalRef, true);

  useEffect(() => {
    if (!isActive) {
      PostUtils.closePostModal(dispatch);
    }
  }, [isActive, dispatch]);

  const childrenArray = React.Children.toArray(children);

  const modalContent = (
    <div
      className="fixed inset-0 z-1050 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto outline-none select-none"
      data-testid="post-modal"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-0 transition-opacity"
        onClick={() => PostUtils.closePostModal(dispatch)}
      ></div>

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
