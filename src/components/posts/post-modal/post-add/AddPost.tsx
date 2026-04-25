import PostWrapper from '@components/posts/modal-wrappers/post-wrapper/PostWrapper';
import '@components/posts/post-modal/post-add/AddPost.scss';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '@redux/store';
import { useEffect, useRef, useState } from 'react';
import ModalBoxContent from '@components/posts/post-modal/modal-box-content/ModalBoxContent';
import { FaArrowLeft, FaTimes, FaSmile } from 'react-icons/fa';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { bgColors, privacyList } from '@services/utils/static.data';
import ModalBoxSelection from '@components/posts/post-modal/modal-box-content/ModalBoxSelection';
import Button from '@components/button/Button';
import { PostUtils } from '@services/utils/post-utils.service';
import { Utils } from '@services/utils/utils.service';
import Giphy from '@components/giphy/Giphy';
import { toggleGifModal } from '@redux/reducers/modal/modal.reducer';
import SelectDropdown from '@components/select-dropdown/SelectDropdown';
import useDetectOutsideClick from '@hooks/useDetectOutsideClick';
import { ImageUtils } from '@services/utils/image-utils.service';
import { postService } from '@services/api/post/post.service';
import type { PostData } from '@app-types/post';
import Spinner from '@components/spinner/Spinner';

const AddPost = ({ selectedImage }: { selectedImage: File | null }) => {
  const { profile } = useSelector((state: RootState) => state.user);
  const { gifModalIsOpen, feeling } = useSelector((state: RootState) => state.modal);
  const { gifUrl, image, video, privacy } = useSelector((state: RootState) => state.post);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [postImage, setPostImage] = useState<string>('');
  const [postVideo, setPostVideo] = useState<string>('');
  const [allowedNumberOfCharacters] = useState('512/512');
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
  const [isColorsExpanded, setIsColorsExpanded] = useState(false);
  const emojiRef = useRef<HTMLDivElement>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useDetectOutsideClick(emojiRef, false);
  const counterRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLDivElement | null>(null);
  const privacyRef = useRef<HTMLDivElement>(null);
  const [togglePrivacy, setTogglePrivacy] = useDetectOutsideClick(privacyRef, false);
  const dispatch = useDispatch<AppDispatch>();

  const maxNumberOfCharacters = 512;

  const selectBackground = (bgColor: string) => {
    PostUtils.selectBackground(bgColor, setTextAreaBackground, setPostData);
  };

  const postInputEditable = (event: React.InputEvent<HTMLDivElement>, textContent: string) => {
    const currentTextLength = event.currentTarget.textContent?.length || 0;
    if (currentTextLength === 0) {
      event.currentTarget.innerHTML = '';
    }
    const counter = maxNumberOfCharacters - currentTextLength;
    counterRef.current!.textContent = `${counter}/512`;
    setDisable(currentTextLength <= 0 && !postImage && !postVideo);
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
    setPostVideo('');
  };
  
  const onEmojiClick = (emojiData: any) => {
    const emoji = emojiData.emoji;
    const text = postData.post + emoji;
    setPostData({ ...postData, post: text });
    
    // Update the editable div content
    if (textAreaBackground !== '#ffffff') {
      if (inputRef.current) inputRef.current.textContent = text;
    } else {
      if (imageInputRef.current) imageInputRef.current.textContent = text;
      else if (inputRef.current) inputRef.current.textContent = text;
    }
    
    // Update counter
    const currentTextLength = text.length;
    const counter = maxNumberOfCharacters - currentTextLength;
    if (counterRef.current) counterRef.current.textContent = `${counter}/512`;
    setDisable(currentTextLength <= 0 && !postImage && !postVideo);
  };

  const createPost = async () => {
    setLoading(!loading);
    setDisable(!disable);
    try {
      if (feeling && typeof feeling === 'object') {
        postData.feelings = (feeling as any).name;
      }
      postData.privacy = privacy || 'Public';
      postData.gifUrl = gifUrl;
      // postData.image = image;
      postData.profilePicture = profile?.profilePicture!;
      if (selectedPostItem || selectedImage) {
        let result = '';
        if (selectedPostItem) {
          result = await ImageUtils.readAsBase64(selectedPostItem);
        }

        if (selectedImage) {
          result = await ImageUtils.readAsBase64(selectedImage);
        }

        const type =
          (selectedPostItem && selectedPostItem.type.includes('video')) ||
          (selectedImage && (selectedImage as File).type.includes('video'))
            ? 'video'
            : 'image';

        if (type === 'image') {
          const response = await PostUtils.sendPostWithImageRequest(
            result,
            postData,
            imageInputRef,
            setApiResponse,
            setLoading,
            dispatch
          );

          if (response && response?.data?.message) {
            Utils.dispatchNotification('Your post has been shared! 🎉', 'success', dispatch);
            PostUtils.closePostModal(dispatch);
          }
        } else {
          const response = await PostUtils.sendPostWithVideoRequest(
            result,
            postData,
            imageInputRef,
            setApiResponse,
            setLoading,
            dispatch
          );

          if (response && response?.data?.message) {
            Utils.dispatchNotification('Your post has been shared! 🎉', 'success', dispatch);
            PostUtils.closePostModal(dispatch);
          }
        }
      } else {
        const response = await postService.createPost(postData);
        if (response) {
          setApiResponse('success');
          setLoading(false);
          Utils.dispatchNotification('Your post has been shared! 🎉', 'success', dispatch);
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
      PostUtils.closePostModal(dispatch);
    }
    setDisable(postData.post.length <= 0 && !postImage && !postVideo);
  }, [loading, dispatch, apiResponse, postImage, postVideo]);

  useEffect(() => {
    if (gifUrl) {
      setPostImage(gifUrl);
      setPostVideo('');
      setSelectedPostItem(null);
      PostUtils.postInputData(imageInputRef, postData, '', setPostData);
    } else if (image) {
      setPostImage(image);
      setPostVideo('');
      PostUtils.postInputData(imageInputRef, postData, '', setPostData);
    } else if (video) {
      setPostVideo(video);
      setPostImage('');
      PostUtils.postInputData(imageInputRef, postData, '', setPostData);
    } else {
      setPostImage('');
      setPostVideo('');
    }
  }, [gifUrl, image, video]);

  return (
    <>
      <PostWrapper loading={loading || aiLoading}>
        <div></div>
        {!gifModalIsOpen && (
          <div
            className="bg-white text-[#050505] rounded-xl shadow-2xl w-full max-w-[650px] flex flex-col relative overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={{
              minHeight: '500px',
              minWidth: '500px',
              height:
                selectedPostItem || gifUrl || image || video || postData?.gifUrl || postData?.image || postData?.video
                  ? 'auto'
                  : 'auto',
              maxHeight: '90vh'
            }}
          >
            {(loading || aiLoading) && (
              <div className="absolute inset-0 bg-white/80 z-10000 flex flex-col items-center justify-center gap-3 animate-in fade-in duration-200">
                <Spinner />
                {aiLoading && <p className="text-primary font-black uppercase tracking-widest text-[12px] animate-pulse">ChattyAI is crafting magic...</p>}
              </div>
            )}

            <div className="flex items-center justify-between px-4 py-4 border-b border-[#e5e5e5] shrink-0">
              <div className="w-9 h-9"></div>
              <h2 className="text-[20px] font-bold">Create post</h2>
              <button
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#f0f2f5] hover:bg-[#e4e6eb] transition-colors cursor-pointer text-[#050505]"
                onClick={closePostModal}
              >
                <FaTimes size={18} />
              </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar grow">
              <ModalBoxContent togglePrivacy={togglePrivacy} setTogglePrivacy={setTogglePrivacy} />

              <div className={`px-4 ${postImage || postVideo ? 'py-1' : 'py-2'} relative group-input`}>
                <div className="relative">
                  <div
                    data-testid="editable"
                    id="editable"
                    ref={(el) => {
                      if (!postImage) {
                        inputRef.current = el;
                        inputRef?.current?.focus();
                      } else {
                        imageInputRef.current = el;
                        imageInputRef?.current?.focus();
                      }
                    }}
                    className={`w-full outline-none wrap-break-word whitespace-pre-wrap custom-scrollbar overflow-y-auto ${
                      textAreaBackground !== '#ffffff'
                        ? 'text-center font-bold text-[28px] text-white pt-[130px] pb-[130px] min-h-[300px]'
                        : `text-[#050505] text-[20px] empty:before:content-[attr(data-placeholder)] empty:before:text-[#65676b] w-full ${postImage || postVideo ? 'min-h-[40px] py-1 max-h-[150px]' : 'min-h-[120px] py-2 max-h-[300px]'}`
                    }`}
                    style={{ background: textAreaBackground !== '#ffffff' ? textAreaBackground : 'transparent' }}
                    contentEditable={true}
                    onInput={(e: any) => postInputEditable(e, e.currentTarget.textContent || '')}
                    onKeyDown={onKeyDown}
                    data-placeholder={`What's on your mind, ${profile?.username}?`}
                  ></div>

                  {textAreaBackground !== '#ffffff' && !postData.post && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-10">
                      <span className="text-white opacity-100 text-center text-[28px] font-bold">
                        {postImage ? `What's on your mind, ${profile?.username}?` : "What's on your mind?..."}
                      </span>
                    </div>
                  )}
                </div>

                {postImage && (
                  <div className="relative group rounded-lg overflow-hidden border-none p-0 bg-transparent">
                    <div
                      className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 transition-colors cursor-pointer text-white"
                      onClick={clearImage}
                    >
                      <FaTimes size={16} />
                    </div>
                    <img src={postImage} alt="" className="w-full h-auto object-contain max-h-[400px] rounded-lg" />
                  </div>
                )}

                {postVideo && (
                  <div className="relative group rounded-lg overflow-hidden border-none p-0 bg-transparent">
                    <div
                      className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 transition-colors cursor-pointer text-white"
                      onClick={clearImage}
                    >
                      <FaTimes size={16} />
                    </div>
                    <video src={postVideo} controls className="w-full h-auto object-contain max-h-[400px] rounded-lg" />
                  </div>
                )}
              </div>
            </div>

            {/* Dropdown overlay positioned relative to the whole modal box */}
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

            <div className="px-4 py-3 shrink-0">
              <div className="flex items-center justify-between gap-2 mb-3 h-10">
                {!postImage && !postVideo && (
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <div
                      className={`w-9 h-9 shrink-0 rounded-lg cursor-pointer flex items-center justify-center bg-linear-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] shadow-md hover:scale-105 transition-all group ${isColorsExpanded ? 'rotate-90 scale-90 opacity-50' : ''}`}
                      onClick={() => setIsColorsExpanded(!isColorsExpanded)}
                    >
                      <span className="text-white font-black text-[15px] group-hover:scale-110 transition-transform">Aa</span>
                    </div>
                    
                    <div className={`flex items-center gap-2 transition-all duration-500 ease-in-out overflow-hidden ${isColorsExpanded ? 'max-w-[450px] opacity-100' : 'max-w-0 opacity-0 pointer-events-none'}`}>
                      <div className="flex gap-1.5 px-2 py-1 bg-gray-50 rounded-xl border border-gray-100 whitespace-nowrap">
                        {bgColors.map((color, index) => (
                          <div
                            key={index}
                            className={`w-7 h-7 rounded-md cursor-pointer border transition-all hover:scale-110 active:scale-90 ${
                              color === '#ffffff' ? 'border-[#ced0d4]' : 'border-transparent'
                            } ${textAreaBackground === color ? 'border-primary ring-1 ring-primary ring-offset-1' : ''}`}
                            style={{ backgroundColor: color }}
                            onClick={() => {
                              PostUtils.positionCursor('editable');
                              selectBackground(color);
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Emoji Picker Trigger */}
                <div className="relative" ref={emojiRef}>
                   <div 
                    className="p-2 text-[#65676b] hover:bg-[#f2f3f5] rounded-full transition-colors cursor-pointer"
                    onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                   >
                    <FaSmile size={24} className={isEmojiPickerOpen ? 'text-primary' : ''} />
                   </div>
                   
                   {isEmojiPickerOpen && (
                     <div className="absolute bottom-full right-0 mb-4 z-10000 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <EmojiPicker 
                          onEmojiClick={onEmojiClick}
                          autoFocusSearch={false}
                          theme={Theme.LIGHT}
                          width={320}
                          height={400}
                        />
                     </div>
                   )}
                </div>
              </div>

              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[13px] text-[#65676b] font-medium" ref={counterRef}>
                  {allowedNumberOfCharacters}
                </span>
              </div>

              <div className="border border-[#ced0d4] rounded-lg mb-4">
                <ModalBoxSelection
                  setSelectedImage={setSelectedPostItem}
                  isBackgroundSelected={textAreaBackground !== '#ffffff'}
                  caption={postData.post}
                  selectedImage={selectedPostItem}
                  postImage={postImage}
                  setPostData={setPostData}
                  setAiLoading={setAiLoading}
                />
              </div>

              <Button
                className="w-full h-10 bg-primary hover:bg-primary/90 disabled:bg-[#e4e6eb] disabled:text-[#bcc0c4] text-white font-bold rounded-lg transition-all border-none text-[16px]"
                label="Post"
                disabled={disable || aiLoading}
                handleClick={createPost}
              />
            </div>
          </div>
        )}

        {gifModalIsOpen && (
          <div className="bg-white text-[#050505] rounded-xl shadow-2xl w-[600px] max-w-[600px] min-h-[500px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="flex items-center px-4 py-4 border-b border-[#e5e5e5]">
              <button
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f2f2f2] transition-colors cursor-pointer text-[#050505]"
                onClick={() => dispatch(toggleGifModal(!gifModalIsOpen))}
              >
                <FaArrowLeft size={18} />
              </button>
              <h2 className="flex-1 text-center text-[20px] font-bold pr-9">Choose a GIF</h2>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              <Giphy />
            </div>
          </div>
        )}
      </PostWrapper>
    </>
  );
};

export default AddPost;
