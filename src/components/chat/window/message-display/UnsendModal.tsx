import { FaTimes } from 'react-icons/fa';

interface UnsendModalProps {
  onClose: () => void;
  onConfirm: (type: 'deleteForEveryone' | 'deleteForMe') => void;
  option: 'deleteForEveryone' | 'deleteForMe';
  setOption: (option: 'deleteForEveryone' | 'deleteForMe') => void;
}

const UnsendModal = ({ onClose, onConfirm, option, setOption }: UnsendModalProps) => {
  return (
    <div
      className="fixed inset-0 z-10000 flex items-center justify-center bg-black/80 transition-opacity duration-300 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[500px] bg-[#242526] rounded-[14px] shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 border border-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 py-6 flex items-center justify-center border-b border-white/5">
          <h3 className="text-[20px] font-bold text-white text-center leading-[1.3] px-14">
            Who do you want to unsend this message for?
          </h3>
          <button
            onClick={onClose}
            className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-[#3a3b3c] hover:bg-[#4e4f50] rounded-full text-white transition-all duration-200 shadow-sm"
          >
            <FaTimes className="text-[16px]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-7 px-8 space-y-8">
          {/* Option 1 */}
          <div className="flex items-start gap-5 cursor-pointer group" onClick={() => setOption('deleteForEveryone')}>
            <div className="mt-1 shrink-0">
              <div
                className={`w-[26px] h-[26px] rounded-full border-2 flex items-center justify-center transition-all duration-200 ${option === 'deleteForEveryone' ? 'border-[#2d88ff]' : 'border-[#4e4f50] group-hover:border-[#606162]'}`}
              >
                {option === 'deleteForEveryone' && <div className="w-[14px] h-[14px] bg-[#2d88ff] rounded-full" />}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[17px] font-bold text-white tracking-tight leading-tight">Unsend for everyone</span>
              <p className="text-[14.5px] text-[#b0b3b8] leading-[1.4] mt-2.5 font-medium">
                This message will be unsent for everyone in the chat. Others may have already seen or forwarded it.
                Unsent messages can still be included in reports.
              </p>
            </div>
          </div>

          {/* Option 2 */}
          <div className="flex items-start gap-5 cursor-pointer group" onClick={() => setOption('deleteForMe')}>
            <div className="mt-1 shrink-0">
              <div
                className={`w-[26px] h-[26px] rounded-full border-2 flex items-center justify-center transition-all duration-200 ${option === 'deleteForMe' ? 'border-[#2d88ff]' : 'border-[#4e4f50] group-hover:border-[#606162]'}`}
              >
                {option === 'deleteForMe' && <div className="w-[14px] h-[14px] bg-[#2d88ff] rounded-full" />}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[17px] font-bold text-white tracking-tight leading-tight">Unsend for you</span>
              <p className="text-[14.5px] text-[#b0b3b8] leading-[1.4] mt-2.5 font-medium">
                This will remove the message from your devices. Other chat members will still be able to see it.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex justify-end items-center gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-[#2d88ff] hover:bg-[#2d88ff]/10 rounded-[10px] text-[16px] font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(option)}
            className="py-3.5 bg-[#4489fe] hover:bg-[#3b7ef3] text-white rounded-full text-[16px] font-bold transition-all shadow-lg shadow-blue-500/10 active:scale-95 px-14"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsendModal;
