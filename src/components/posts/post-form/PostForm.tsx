import Avatar from '@components/avatar/Avatar';
import Input from '@components/input/Input';
import type { AppDispatch, RootState } from '@redux/store';
import { useSelector } from 'react-redux';
import '@components/posts/post-form/PostForm.scss';
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
      <div className="post-form" data-testid="post-form">
        <div className="post-form-row">
          <div className="post-form-header">
            <h4 className="post-form-title">Create Post</h4>
          </div>
          <div className="post-form-body">
            <div className="post-form-input-body" data-testid="input-body" onClick={openPostModal}>
              <Avatar
                name={profile?.username!}
                bgColor={profile?.avatarColor!}
                textColor="#ffffff"
                size={50}
                avatarSrc={profile?.profilePicture!}
              />
              <div className="post-form-input" data-placeholder="Write something here..."></div>
            </div>
            <hr />
            <ul className="post-form-list" data-testid="list-item">
              <li className="post-form-list-item image-select" onClick={openImageModel}>
                <Input
                  name="image"
                  ref={fileInputRef}
                  type="file"
                  className="file-input"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  onChange={handleFileChange}
                />
                <img src={photoIcon} alt="" /> Photo
              </li>
              <li className="post-form-list-item" onClick={openGifModal}>
                <img src={gifIcon} alt="" /> Gif
              </li>
              <li className="post-form-list-item" onClick={openFeelingComponent}>
                <img src={feelingIcon} alt="" /> Feeling
              </li>
            </ul>
          </div>
        </div>
      </div>
      {isOpen && type === 'add' && <AddPost selectedImage={selectedImage} />}
      {isOpen && type === 'edit' && <EditPost />}
    </>
  );
};

export default PostForm;
