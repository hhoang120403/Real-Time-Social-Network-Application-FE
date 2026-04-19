import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';

interface IDialogProps {
  title: string;
  subTitle?: string;
  showButtons: boolean;
  firstButtonText: string;
  secondButtonText: string;
  firstBtnHandler: () => void;
  secondBtnHandler: () => void;
}

const Dialog = ({
  title,
  subTitle,
  showButtons,
  firstButtonText,
  secondButtonText,
  firstBtnHandler,
  secondBtnHandler
}: IDialogProps) => {
  return createPortal(
    <div
      className="fixed inset-0 z-10000 flex items-center justify-center px-4"
      data-testid="dialog-container"
      onMouseDown={secondBtnHandler}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      <div
        className="relative bg-[#242526] w-full max-w-[548px] rounded-lg shadow-2xl overflow-hidden flex flex-col font-sans border border-[#3e4042]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex items-center justify-center p-4 border-b border-[#3e4042]">
          <h2 className="text-[20px] font-bold text-[#e4e6eb]">{title}</h2>
          <div
            className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#3a3b3c] flex items-center justify-center cursor-pointer hover:bg-[#4e4f50] transition-colors"
            onClick={secondBtnHandler}
          >
            <FaTimes className="text-[#b0b3b8] text-[20px]" />
          </div>
        </div>

        {/* Body */}
        <div className="p-4">{subTitle && <p className="text-[15px] text-[#b0b3b8] leading-[20px]">{subTitle}</p>}</div>

        {/* Footer */}
        {showButtons && (
          <div className="flex items-center justify-end p-4 gap-3 bg-[#242526]">
            <button
              className="px-6 py-2 rounded-md text-[15px] font-semibold text-[#2d88ff] hover:bg-[#3a3b3c] transition-colors"
              onClick={secondBtnHandler}
            >
              {secondButtonText}
            </button>
            <button
              className="px-8 py-2 rounded-md text-[15px] font-semibold text-white bg-[#2d88ff] hover:bg-[#1a73e8] transition-colors"
              onClick={firstBtnHandler}
            >
              {firstButtonText}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Dialog;
