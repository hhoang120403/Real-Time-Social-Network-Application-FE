import { createPortal } from 'react-dom';
import React from 'react';
import '@components/posts/modal-wrappers/reaction-wrapper/ReactionWrapper.scss';

interface IReactionWrapperProps {
  children: React.ReactNode;
  closeModal: () => void;
}

const ReactionWrapper = ({ children, closeModal }: IReactionWrapperProps) => {
  const childrenArray = React.Children.toArray(children);
  
  const modalContent = (
    <div className="modal-wrapper" data-testid="modal-wrapper">
      <div className="modal-wrapper-container">
        <div className="modal-wrapper-container-header">
          {childrenArray[0]}
          <button onClick={closeModal}>X</button>
        </div>
        <hr />
        <div className="modal-wrapper-container-body" data-testid="modal-body">
          {childrenArray[1] || childrenArray.slice(1)}
        </div>
      </div>
      <div className="modal-bg" data-testid="modal-bg" onClick={closeModal}></div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ReactionWrapper;
