import PostWrapper from '@components/posts/modal-wrappers/post-wrapper/PostWrapper';
import '@components/posts/post-modal/post-add/AddPost.scss';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '@redux/store';
import { useEffect, useRef, useState } from 'react';
import ModalBoxContent from '@components/posts/post-modal/modal-box-content/ModalBoxContent';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';
import { bgColors } from '@services/utils/static.data';
import ModalBoxSelection from '@components/posts/post-modal/modal-box-content/ModalBoxSelection';
import Button from '@components/button/Button';
import { PostUtils } from '@services/utils/post-utils.service';
import Giphy from '@components/giphy/Giphy';
import { closeModal, toggleGifModal } from '@redux/reducers/modal/modal.reducer';
import { ImageUtils } from '@services/utils/image-utils.service';
import { postService } from '@services/api/post/post.service';
import type { PostData } from '@app-types/post';
import Spinner from '@components/spinner/Spinner';

const AddPost = ({ selectedImage }: { selectedImage: File | null }) => {
  const { profile } = useSelector((state: RootState) => state.user);
  const { gifModalIsOpen, feeling } = useSelector((state: RootState) => state.modal);
  const { gifUrl, image, privacy } = useSelector((state: RootState) => state.post);
  const [loading, setLoading] = useState(false);
  const [postImage, setPostImage] = useState<string>('');
  const [allowedNumberOfCharacters] = useState('255/255');
  const [textAreaBackground, setTextAreaBackground] = useState('#ffffff');
  const [postData, setPostData] = useState<PostData>({
    post: '',
    bgColor: textAreaBackground,
    privacy: '',
    feelings: '',
    gifUrl: '',
    profilePicture: '',
    image: ''
  });
  const [disable, setDisable] = useState(true);
  const [apiResponse, setApiResponse] = useState('');
  const [selectedPostItem, setSelectedPostItem] = useState<File | null>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const maxNumberOfCharacters = 255;

  const selectBackground = (bgColor: string) => {
    PostUtils.selectBackground(bgColor, postData, setTextAreaBackground, setPostData);
  };

  const postInputEditable = (event: React.InputEvent<HTMLDivElement>, textContent: string) => {
    const currentTextLength = event.currentTarget.textContent?.length || 0;
    if (currentTextLength === 0) {
      event.currentTarget.innerHTML = '';
    }
    const counter = maxNumberOfCharacters - currentTextLength;
    counterRef.current!.textContent = `${counter}/255`;
    setDisable(currentTextLength <= 0 && !postImage);
    PostUtils.postInputEditable(textContent, postData, setPostData);
  };

  const closePostModal = () => {
    PostUtils.closePostModal(dispatch);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const currentTextLength = event.currentTarget.textContent?.length || 0;
    if (currentTextLength === maxNumberOfCharacters && event.key !== 'Backspace') {
      event.preventDefault();
    }
  };

  const clearImage = () => {
    PostUtils.clearImage(postData, '', inputRef, dispatch, setSelectedPostItem, setPostImage, setPostData);
  };

  const createPost = async () => {
    setLoading(!loading);
    setDisable(!disable);
    try {
      if (Object.keys(feeling).length) {
        postData.feelings = feeling?.name;
      }
      postData.privacy = privacy || 'Public';
      postData.gifUrl = gifUrl;
      postData.image = image;
      postData.profilePicture = profile?.profilePicture!;
      if (selectedPostItem || selectedImage) {
        let result = '';
        if (selectedPostItem) {
          result = await ImageUtils.readAsBase64(selectedPostItem);
        }

        if (selectedImage) {
          result = await ImageUtils.readAsBase64(selectedImage);
        }

        const response = await PostUtils.sendPostWithImageRequest(
          result,
          postData,
          imageInputRef,
          setApiResponse,
          setLoading,

          dispatch
        );

        if (response && response?.data?.message) {
          PostUtils.closePostModal(dispatch);
        }
      } else {
        const response = await postService.createPost(postData);
        if (response) {
          setApiResponse('success');
          setLoading(false);
          PostUtils.closePostModal(dispatch);
        }
      }
    } catch (error: any) {
      PostUtils.dispatchNotification(error.response.data.message, 'error', setApiResponse, setLoading, dispatch);
    }
  };

  useEffect(() => {
    PostUtils.positionCursor('editable');
  }, []);

  useEffect(() => {
    if (!loading && apiResponse === 'success') {
      dispatch(closeModal());
    }
    setDisable(postData.post.length <= 0 && !postImage);
  }, [loading, dispatch, apiResponse, postData, postImage]);

  useEffect(() => {
    if (gifUrl) {
      setPostImage(gifUrl);
      PostUtils.postInputData(imageInputRef, postData, '', setPostData);
    } else if (image) {
      setPostImage(image);
      PostUtils.postInputData(imageInputRef, postData, '', setPostData);
    }
  }, [gifUrl, image, postData]);

  return (
    <>
      <PostWrapper>
        <div></div>
        {!gifModalIsOpen && (
          <div
            className="modal-box"
            style={{
              height: selectedPostItem || gifUrl || image || postData?.gifUrl || postData?.image ? '700px' : 'auto'
            }}
          >
            {loading && (
              <div className="modal-box-loading">
                <span>Posting...</span>
                <Spinner />
              </div>
            )}
            <div className="modal-box-header">
              <h2>Create Post</h2>
              <button className="modal-box-header-cancel" onClick={closePostModal}>
                X
              </button>
            </div>
            <hr />
            <ModalBoxContent />

            {!postImage && (
              <>
                <div className="modal-box-form" data-testid="modal-box-form" style={{ background: textAreaBackground }}>
                  <div className="main" style={{ margin: textAreaBackground !== '#ffffff' ? '0 auto' : '' }}>
                    <div className="flex-row">
                      <div
                        data-testid="editable"
                        id="editable"
                        ref={(el) => {
                          inputRef.current = el;
                          inputRef?.current?.focus();
                        }}
                        className={`editable flex-item ${textAreaBackground !== '#ffffff' ? 'textInputColor' : ''} ${postData.post.length === 0 && textAreaBackground !== '#ffffff' ? 'defaultInputTextColor' : ''}`}
                        contentEditable={true}
                        onInput={(e) => postInputEditable(e, e.currentTarget.textContent || '')}
                        onKeyDown={onKeyDown}
                        data-placeholder="What's on your mind?..."
                      ></div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {postImage && (
              <>
                <div className="modal-box-image-form">
                  <div
                    data-testid="editable"
                    id="editable"
                    ref={(el) => {
                      imageInputRef.current = el;
                      imageInputRef?.current?.focus();
                    }}
                    className="post-input flex-item"
                    contentEditable={true}
                    onInput={(e) => postInputEditable(e, e.currentTarget.textContent || '')}
                    onKeyDown={onKeyDown}
                    data-placeholder={`What's on your mind, ${profile?.username}?`}
                  ></div>
                  <div className="image-display">
                    <div className="image-delete-btn" onClick={clearImage}>
                      <FaTimes />
                    </div>
                    <img src={postImage} alt="" className="post-image" />
                  </div>
                </div>
              </>
            )}

            <div className="modal-box-bg-colors">
              <ul>
                {bgColors.map((color, index) => (
                  <li
                    key={index}
                    className={`${color === '#ffffff' ? 'whiteColorBorder' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      PostUtils.positionCursor('editable');
                      selectBackground(color);
                    }}
                  ></li>
                ))}
              </ul>
            </div>
            <span className="char_count" ref={counterRef}>
              {allowedNumberOfCharacters}
            </span>

            <ModalBoxSelection setSelectedImage={setSelectedPostItem} />

            <div className="modal-box-button">
              <Button className="post-button" label="Next" disabled={disable} handleClick={createPost} />
            </div>
          </div>
        )}

        {gifModalIsOpen && (
          <div className="modal-giphy">
            <div className="modal-giphy-header">
              <Button
                label={<FaArrowLeft />}
                className="back-button"
                disabled={false}
                handleClick={() => dispatch(toggleGifModal(!gifModalIsOpen))}
              />
              <h2>Choose a GIF</h2>
            </div>
            <hr />
            <Giphy />
          </div>
        )}
      </PostWrapper>
    </>
  );
};

export default AddPost;
