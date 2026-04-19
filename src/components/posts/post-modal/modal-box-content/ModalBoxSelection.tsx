import photo from '@assets/images/photo.png';
import gif from '@assets/images/gif.png';
import feelingImg from '@assets/images/feeling.png';
import useDetectOutsideClick from '@hooks/useDetectOutsideClick';
import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@redux/store';
import Feelings from '@components/feelings/Feelings';
import { ImageUtils } from '@services/utils/image-utils.service';
import { toggleGifModal } from '@redux/reducers/modal/modal.reducer';

interface ModalBoxSelectionProps {
  setSelectedImage: (image: File) => void;
  isBackgroundSelected?: boolean;
}

const ModalBoxSelection = ({ setSelectedImage, isBackgroundSelected }: ModalBoxSelectionProps) => {
  const { gifModalIsOpen, feelingsIsOpen } = useSelector((state: RootState) => state.modal);
  const feelingsRef = useRef<HTMLDivElement>(null);
  const [isFeelingsOpen, setIsFeelingsOpen] = useDetectOutsideClick(feelingsRef, feelingsIsOpen);
  const { post } = useSelector((state: RootState) => state.post);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<AppDispatch>();

  const fileInputClicked = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const type = file.type.includes('image') ? 'image' : 'video';
      ImageUtils.addFileToRedux(event, post, setSelectedImage, dispatch, type);
    }
  };

  return (
    <div className="flex flex-col gap-3 select-none">
      <div className="p-2">
        <div className="flex items-center justify-between px-3 py-1">
          <span className="font-bold text-[15px] text-[#050505]">Add to your post</span>
          <div className="flex items-center gap-1">
            {/* Photo Item */}
            {!isBackgroundSelected && (
              <div className="relative group">
                <div
                  className="p-2 rounded-full hover:bg-[#f2f3f5] transition-colors cursor-pointer"
                  onClick={fileInputClicked}
                >
                  <input
                    name="image"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    onChange={handleFileChange}
                  />
                  <img src={photo} alt="" className="w-6 h-6" />
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#e4e6eb] text-[#050505] text-[12px] rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-medium">
                  Photo/video
                </div>
              </div>
            )}

            {/* GIF Item */}
            {!isBackgroundSelected && (
              <div className="relative group">
                <div
                  className="p-2 rounded-full hover:bg-[#f2f3f5] transition-colors cursor-pointer"
                  onClick={() => dispatch(toggleGifModal(!gifModalIsOpen))}
                >
                  <img src={gif} alt="" className="w-6 h-6" />
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#e4e6eb] text-[#050505] text-[12px] rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-medium">
                  GIF
                </div>
              </div>
            )}

            {/* Feeling Item */}
            <div className="relative group" ref={feelingsRef}>
              <div
                className="p-2 rounded-full hover:bg-[#f2f3f5] transition-colors cursor-pointer"
                onClick={() => setIsFeelingsOpen(!isFeelingsOpen)}
              >
                <img src={feelingImg} alt="" className="w-6 h-6" />
              </div>

              {isFeelingsOpen && (
                <div className="absolute bottom-full right-0 mb-4 z-1000 w-[250px] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <Feelings onSelection={() => setIsFeelingsOpen(false)} />
                </div>
              )}

              {!isFeelingsOpen && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#e4e6eb] text-[#050505] text-[12px] rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-medium">
                  Feeling
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalBoxSelection;
