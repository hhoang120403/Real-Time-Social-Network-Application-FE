import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import gif from '@assets/images/gif.png';
import photo from '@assets/images/photo.png';
import feeling from '@assets/images/feeling.png';
import loadable from '@loadable/component';
import { useState, useRef, useEffect } from 'react';
import { ImageUtils } from '@services/utils/image-utils.service';
import GiphyContainer from '@components/chat/giphy-container/GiphyContainer';
import ImagePreview from '@components/chat/image-preview/ImagePreview';

import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@redux/store';

interface MessageInputProps {
  setChatMessage: (message: string, gifUrl: string, image: string) => void;
  editMessageData?: any;
  onCancelEdit?: () => void;
  submitEditMessage?: (message: string, gifUrl: string, selectedImage: string) => void;
}

const EmojiPickerComponent = loadable(() => import('./EmojiPicker'), {
  fallback: (
    <p className="absolute bottom-14 left-16 rounded-md bg-slate-900 px-2 py-1 text-[12px] font-semibold text-white">
      Loading...
    </p>
  )
});

const MessageInput = ({ setChatMessage, editMessageData, onCancelEdit, submitEditMessage }: MessageInputProps) => {
  let [message, setMessage] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const [showEmojiContainer, setShowEmojiContainer] = useState(false);
  const [showGifContainer, setShowGifContainer] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [file, setFile] = useState<string>('');
  const [base64File, setBase64File] = useState('');
  const [editingGifUrl, setEditingGifUrl] = useState('');
  const [hasFocus, setHasFocus] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const gifPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const gifButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (editMessageData) {
      const editableBody =
        editMessageData.body === 'Sent an Image' || editMessageData.body === 'Sent a GIF'
          ? ''
          : editMessageData.body || '';
      setMessage(editableBody);
      setEditingGifUrl(editMessageData.gifUrl || '');
      setBase64File(editMessageData.selectedImage || '');
      setFile(editMessageData.selectedImage || editMessageData.gifUrl || '');
      setShowImagePreview(Boolean(editMessageData.selectedImage || editMessageData.gifUrl));

      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
    } else {
      setMessage('');
      setEditingGifUrl('');
      setFile('');
      setBase64File('');
      setShowImagePreview(false);
    }
  }, [editMessageData]);

  const handleClick = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editMessageData && submitEditMessage) {
      const finalMessage = message.trim() || (editingGifUrl ? 'Sent a GIF' : base64File ? 'Sent an Image' : '');
      if (!finalMessage) return;
      submitEditMessage(finalMessage.replace(/ +(?= )/g, ' '), editingGifUrl, base64File);
      reset();
    } else {
      let finalMessage = message || 'Sent an Image';
      setChatMessage(finalMessage.replace(/ +(?= )/g, ' '), '', base64File);
      setMessage('');
      reset();
    }
  };

  const handleGiphyClick = (url: string) => {
    if (editMessageData) {
      setEditingGifUrl(url);
      setBase64File('');
      setFile(url);
      setShowImagePreview(true);
      setShowGifContainer(false);
      setShowEmojiContainer(false);
      return;
    }

    setChatMessage('Sent a GIF', url, '');
    reset();
  };

  const addToPreview = async (file: File) => {
    if (!ImageUtils.checkFile(file, 'image', dispatch)) return;
    setFile(URL.createObjectURL(file));
    const result = await ImageUtils.readAsBase64(file);
    setBase64File(result);
    setEditingGifUrl('');
    setShowImagePreview(true);
    setShowEmojiContainer(false);
    setShowGifContainer(false);
  };

  const fileInputClicked = () => {
    fileInputRef.current?.click();
  };

  const reset = () => {
    setBase64File('');
    setEditingGifUrl('');
    setFile('');
    setShowImagePreview(false);
    setShowEmojiContainer(false);
    setShowGifContainer(false);
  };

  useEffect(() => {
    if (messageInputRef?.current && !editMessageData) {
      messageInputRef.current.focus();
    }
  }, [setChatMessage, editMessageData]);

  useEffect(() => {
    const closePickerOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedEmojiPicker = emojiPickerRef.current?.contains(target);
      const clickedGifPicker = gifPickerRef.current?.contains(target);
      const clickedEmojiButton = emojiButtonRef.current?.contains(target);
      const clickedGifButton = gifButtonRef.current?.contains(target);

      if (!clickedEmojiPicker && !clickedGifPicker && !clickedEmojiButton && !clickedGifButton) {
        setShowEmojiContainer(false);
        setShowGifContainer(false);
      }
    };

    document.addEventListener('mousedown', closePickerOnOutsideClick);
    return () => document.removeEventListener('mousedown', closePickerOnOutsideClick);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[800px]" data-testid="chat-inputarea">
      {showEmojiContainer && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-[calc(100%+14px)] left-0 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <EmojiPickerComponent
            onEmojiClick={(emojiData) => {
              setMessage((text) => text + ` ${emojiData.emoji}`);
            }}
            pickerStyle={{ width: '352px', height: '330px' }}
          />
        </div>
      )}
      {showGifContainer && (
        <div ref={gifPickerRef}>
          <GiphyContainer handleGiphyClick={handleGiphyClick} />
        </div>
      )}
      {showImagePreview && (
        <div className="absolute bottom-full left-0 w-full mb-4 animate-in slide-in-from-bottom-2 duration-300">
          <ImagePreview
            image={file}
            onRemoveImage={() => {
              setFile('');
              setBase64File('');
              setEditingGifUrl('');
              setShowImagePreview(false);
            }}
          />
        </div>
      )}

      {editMessageData && (
        <div className="absolute bottom-full px-4 mb-2 flex items-center gap-2 bg-blue-50 text-blue-600 rounded-lg py-1 shadow-sm border border-blue-100">
          <span className="text-[13px] font-semibold flex-1">Editing message...</span>
          <button type="button" onClick={onCancelEdit} className="p-1 hover:bg-blue-100 rounded-full transition-colors">
            <FaTimes className="text-[12px]" />
          </button>
        </div>
      )}

      <form onSubmit={handleClick} className="flex items-end gap-3 px-2">
        {/* Action Buttons Group */}
        <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-2xl mb-1 shrink-0 transition-all hover:bg-gray-100">
          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm text-gray-500 hover:text-primary transition-all group"
            onClick={() => {
              fileInputClicked();
              setShowEmojiContainer(false);
              setShowGifContainer(false);
            }}
          >
            <input
              ref={fileInputRef}
              id="image"
              name="image"
              type="file"
              className="hidden"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              onChange={(event) => addToPreview(event.target.files?.[0] as File)}
            />
            <img src={photo} alt="Photo" className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>

          <button
            ref={gifButtonRef}
            type="button"
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all group ${showGifContainer ? 'bg-white shadow-sm text-primary' : 'hover:bg-white hover:shadow-sm text-gray-500 hover:text-primary'}`}
            onClick={() => {
              setShowGifContainer(!showGifContainer);
              setShowEmojiContainer(false);
              setShowImagePreview(false);
            }}
          >
            <img src={gif} alt="Gif" className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>

          <button
            ref={emojiButtonRef}
            type="button"
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all group ${showEmojiContainer ? 'bg-white shadow-sm text-primary' : 'hover:bg-white hover:shadow-sm text-gray-500 hover:text-primary'}`}
            onClick={() => {
              setShowEmojiContainer(!showEmojiContainer);
              setShowGifContainer(false);
              setShowImagePreview(false);
            }}
          >
            <img src={feeling} alt="Feeling" className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Combined Input & Send Button */}
        <div
          className={`flex-1 flex items-center gap-2 bg-gray-100 rounded-[24px] px-4 py-1.5 transition-all border-2 ${hasFocus ? 'bg-white border-primary/20 ring-4 ring-primary/5 shadow-sm' : 'border-transparent hover:bg-gray-200/70'}`}
        >
          <button
            type="button"
            className="text-gray-400 hover:text-primary transition-colors pr-1 active:scale-90"
            title="Voice message (Coming soon)"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </button>
          <input
            ref={messageInputRef}
            id="message"
            name="message"
            type="text"
            value={message}
            className="flex-1 bg-transparent border-none outline-none py-1.5 text-[15px] text-gray-800 placeholder:text-gray-500 font-medium"
            placeholder={editMessageData ? 'Edit message...' : 'Type your message...'}
            autoComplete="off"
            onFocus={() => setHasFocus(true)}
            onBlur={() => setHasFocus(false)}
            onChange={(event) => setMessage(event.target.value)}
          />

          <button
            type="submit"
            disabled={
              (!message.trim() && !showImagePreview) ||
              (editMessageData &&
                message.trim() ===
                  (editMessageData.body === 'Sent an Image' || editMessageData.body === 'Sent a GIF'
                    ? ''
                    : editMessageData.body) &&
                editingGifUrl === (editMessageData.gifUrl || '') &&
                base64File === (editMessageData.selectedImage || ''))
            }
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 active:scale-95 shrink-0 ${
              (message.trim() || showImagePreview) &&
              !(
                editMessageData &&
                message.trim() ===
                  (editMessageData.body === 'Sent an Image' || editMessageData.body === 'Sent a GIF'
                    ? ''
                    : editMessageData.body) &&
                editingGifUrl === (editMessageData.gifUrl || '') &&
                base64File === (editMessageData.selectedImage || '')
              )
                ? 'bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-hover'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <FaPaperPlane
              className={`text-[15px] transition-all ${
                (message.trim() || showImagePreview) &&
                !(
                  editMessageData &&
                  message.trim() ===
                    (editMessageData.body === 'Sent an Image' || editMessageData.body === 'Sent a GIF'
                      ? ''
                      : editMessageData.body) &&
                  editingGifUrl === (editMessageData.gifUrl || '') &&
                  base64File === (editMessageData.selectedImage || '')
                )
                  ? 'scale-110'
                  : ''
              }`}
            />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
