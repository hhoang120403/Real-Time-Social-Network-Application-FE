import PostWrapper from '@components/posts/modal-wrappers/post-wrapper/PostWrapper';
import '@components/posts/post-modal/post-edit/EditPost.scss';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '@redux/store';
import { useCallback, useEffect, useRef, useState } from 'react';
import ModalBoxContent from '@components/posts/post-modal/modal-box-content/ModalBoxContent';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';
import { bgColors, feelingsList, privacyList } from '@services/utils/static.data';
import ModalBoxSelection from '@components/posts/post-modal/modal-box-content/ModalBoxSelection';
import Button from '@components/button/Button';
import { PostUtils } from '@services/utils/post-utils.service';
import Giphy from '@components/giphy/Giphy';
import { addPostFeeling, toggleGifModal } from '@redux/reducers/modal/modal.reducer';
import { ImageUtils } from '@services/utils/image-utils.service';
import type { PostData } from '@app-types/post';
import Spinner from '@components/spinner/Spinner';
import { find } from 'lodash';
import { Utils } from '@services/utils/utils.service';
import SelectDropdown from '@components/select-dropdown/SelectDropdown';
import useDetectOutsideClick from '@hooks/useDetectOutsideClick';

const EditPost = () => {
  const { profile } = useSelector((state: RootState) => state.user);
  const { gifModalIsOpen, feeling } = useSelector((state: RootState) => state.modal);
  const { post } = useSelector((state: RootState) => state);
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
    image: '',
    imgId: '',
    imgVersion: ''
  });
  const [disable, setDisable] = useState(true);
  const [apiResponse, setApiResponse] = useState('');
  const [selectedPostItem, setSelectedPostItem] = useState<File | null>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLDivElement | null>(null);
  const privacyRef = useRef<HTMLDivElement>(null);
  const [togglePrivacy, setTogglePrivacy] = useDetectOutsideClick(privacyRef, false);
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
    PostUtils.clearImage(
      postData,
      post?.post || '',
      inputRef,
      dispatch,
      setSelectedPostItem,
      setPostImage,
      setPostData
    );
  };

  const updatePost = async () => {
    setLoading(!loading);
    setDisable(!disable);
    try {
      if (Object.keys(feeling).length) {
        postData.feelings = feeling?.name;
      }
      if (postData.gifUrl || (postData.imgId && postData.imgVersion)) {
        postData.bgColor = '#ffffff';
      }
      postData.privacy = post?.privacy || 'Public';
      postData.profilePicture = profile?.profilePicture!;

      if (selectedPostItem) {
        const result = await ImageUtils.readAsBase64(selectedPostItem);
        await PostUtils.sendUpdatePostWithImageRequest(
          result,
          post?._id,
          postData,
          setApiResponse,
          setLoading,
          dispatch
        );
      } else {
        await PostUtils.sendUpdatePostRequest(post?._id, postData, setApiResponse, setLoading, dispatch);
      }
    } catch (error: any) {
      PostUtils.dispatchNotification(error.response.data.message, 'error', setApiResponse, setLoading, dispatch);
    }
  };

  const getFeeling = useCallback(
    (name: string) => {
      const feeling = find(feelingsList, (data) => data.name === name);
      dispatch(addPostFeeling({ feeling }));
    },
    [dispatch]
  );

  const postInputData = useCallback(() => {
    setTimeout(() => {
      if (imageInputRef?.current) {
        postData.post = post?.post || '';
        imageInputRef.current.textContent = post?.post;
        setPostData(postData);
        PostUtils.positionCursor('editable');
      }
    });
  }, [post, postData]);

  const editableFields = useCallback(() => {
    if (post?.feelings) {
      getFeeling(post?.feelings);
    }

    if (post?.bgColor) {
      postData.bgColor = post?.bgColor;
      setPostData(postData);
      setTextAreaBackground(post?.bgColor);
      setTimeout(() => {
        if (inputRef?.current) {
          postData.post = post?.post;
          inputRef.current.textContent = post?.post;
          setPostData(postData);
          PostUtils.positionCursor('editable');
        }
      });
    }

    if (post?.gifUrl && !post?.imgId) {
      postData.gifUrl = post?.gifUrl;
      postData.imgId = '';
      postData.imgVersion = '';
      postData.image = '';
      setPostImage(post?.gifUrl);
      postInputData();
    }

    if (post?.imgId && !post?.gifUrl) {
      postData.imgId = post?.imgId;
      postData.imgVersion = post?.imgVersion;
      const imageUrl = Utils.getImage(post?.imgId, post?.imgVersion);
      setPostImage(imageUrl);
      postInputData();
    }
  }, [post, postData, getFeeling, postInputData]);

  useEffect(() => {
    PostUtils.positionCursor('editable');
  }, [post]);

  useEffect(() => {
    setTimeout(() => {
      if (imageInputRef?.current && imageInputRef?.current.textContent?.length) {
        const counter = maxNumberOfCharacters - imageInputRef?.current.textContent?.length;
        counterRef.current!.textContent = `${counter}/255`;
      } else if (inputRef?.current && inputRef?.current.textContent?.length) {
        const counter = maxNumberOfCharacters - inputRef?.current.textContent?.length;
        counterRef.current!.textContent = `${counter}/255`;
      }
    });
  }, []);

  useEffect(() => {
    if (!loading && apiResponse === 'success') {
      PostUtils.closePostModal(dispatch);
    }
    setDisable(post?.post.length <= 0 && !postImage);
  }, [loading, dispatch, apiResponse, post, postImage]);

  useEffect(() => {
    if (post?.gifUrl) {
      postData.image = '';
      setSelectedPostItem(null);
      setPostImage(post?.gifUrl);
      PostUtils.postInputData(imageInputRef, postData, post?.post, setPostData);
    } else if (post?.image) {
      setPostImage(post?.image);
      PostUtils.postInputData(imageInputRef, postData, post?.post, setPostData);
    }
    editableFields();
  }, [editableFields, post, postData]);

  return (
    <>
      <PostWrapper>
        <div></div>
        {!gifModalIsOpen && (
          <div
            className="modal-box"
            style={{
              height: selectedPostItem || post?.gifUrl || post?.imgId ? '700px' : 'auto'
            }}
          >
            {loading && (
              <div className="modal-box-loading">
                <span>Updating...</span>
                <Spinner />
              </div>
            )}
            <div className="modal-box-header">
              <h2>Edit Post</h2>
              <button className="modal-box-header-cancel" onClick={closePostModal}>
                X
              </button>
            </div>
            <hr />
            <ModalBoxContent togglePrivacy={togglePrivacy} setTogglePrivacy={setTogglePrivacy} />

            {togglePrivacy && (
              <div
                ref={privacyRef}
                className="absolute top-[135px] left-[70px] z-999 animate-in fade-in zoom-in-95 duration-200"
              >
                <SelectDropdown
                  isActive={togglePrivacy}
                  items={privacyList}
                  setSelectedItem={() => {}}
                  toggleDropdown={setTogglePrivacy}
                />
              </div>
            )}

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
              <Button className="post-button" label="Update" disabled={disable} handleClick={updatePost} />
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

export default EditPost;
