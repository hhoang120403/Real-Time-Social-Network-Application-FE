import Avatar from '@components/avatar/Avatar';
import type { AppDispatch, RootState } from '@redux/store';
import { useSelector } from 'react-redux';
import photoIcon from '@assets/images/photo.png';
import gifIcon from '@assets/images/gif.png';
import feelingIcon from '@assets/images/feeling.png';
import { useDispatch } from 'react-redux';
import { openModal, toggleFeelingModal, toggleGifModal, toggleImageModal } from '@redux/reducers/modal/modal.reducer';
import AddPost from '../post-modal/post-add/AddPost';
import { useRef } from 'react';
import { ImageUtils } from '@services/utils/image-utils.service';
import { useState, useEffect } from 'react';
import EditPost from '../post-modal/post-edit/EditPost';

const PostForm = () => {
  const { profile } = useSelector((state: RootState) => state.user);
  const { type, isOpen, openFileDialog, gifModalIsOpen, feelingsIsOpen } = useSelector(
    (state: RootState) => state.modal
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!isOpen) {
      setSelectedImage(null);
    }
  }, [isOpen]);

  const openPostModal = () => {
    dispatch(openModal({ type: 'add' }));
  };

  const openImageModel = () => {
    fileInputRef.current?.click();
    dispatch(openModal({ type: 'add' }));
    dispatch(toggleImageModal(!openFileDialog));
  };

  const openGifModal = () => {
    dispatch(openModal({ type: 'add' }));
    dispatch(toggleGifModal(!gifModalIsOpen));
  };

  const openFeelingComponent = () => {
    dispatch(openModal({ type: 'add' }));
    dispatch(toggleFeelingModal(!feelingsIsOpen));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    ImageUtils.addFileToRedux(event, '', setSelectedImage, dispatch, 'image');
  };

  return (
    <>
      <div 
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3 select-none" 
        data-testid="post-form"
      >
        <div className="shrink-0">
          <Avatar
            name={profile?.username!}
            bgColor={profile?.avatarColor!}
            textColor="#ffffff"
            size={40}
            avatarSrc={profile?.profilePicture!}
          />
        </div>
        
        <div 
          className="flex-1 bg-[#f0f2f5] hover:bg-[#e4e6e9] transition-colors rounded-full px-3 sm:px-4 py-2 sm:py-2.5 cursor-pointer text-gray-500 text-[14px] sm:text-[15px] truncate" 
          data-testid="input-body" 
          onClick={openPostModal}
        >
          What's on your mind, {profile?.username}?
        </div>

        <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
          {/* Photo/Video Icon */}
          <div 
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer group relative"
            title="Photo/Video"
            onClick={openImageModel}
          >
            <input
              name="image"
              ref={fileInputRef}
              type="file"
              className="hidden"
              onClick={(e) => {
                e.stopPropagation();
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              onChange={handleFileChange}
            />
            <img 
              src={photoIcon} 
              alt="" 
              className="w-6 h-6 object-contain group-hover:scale-110 transition-transform" 
            />
          </div>

          {/* Gif Icon */}
          <div 
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer group"
            title="GIF"
            onClick={openGifModal}
          >
            <img 
              src={gifIcon} 
              alt="" 
              className="w-6 h-6 object-contain group-hover:scale-110 transition-transform" 
            />
          </div>

          {/* Feeling Icon */}
          <div 
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer group"
            title="Feeling/Activity"
            onClick={openFeelingComponent}
          >
            <img 
              src={feelingIcon} 
              alt="" 
              className="w-6 h-6 object-contain group-hover:scale-110 transition-transform" 
            />
          </div>
        </div>
      </div>
      {isOpen && type === 'add' && <AddPost selectedImage={selectedImage} />}
      {isOpen && type === 'edit' && <EditPost />}
    </>
  );
};

export default PostForm;
