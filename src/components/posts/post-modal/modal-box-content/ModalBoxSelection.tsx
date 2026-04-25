import photo from '@assets/images/photo.png';
import gif from '@assets/images/gif.png';
import feelingImg from '@assets/images/feeling.png';
import useDetectOutsideClick from '@hooks/useDetectOutsideClick';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@redux/store';
import Feelings from '@components/feelings/Feelings';
import { ImageUtils } from '@services/utils/image-utils.service';
import { FaRobot, FaMagic, FaPencilAlt, FaShieldAlt, FaClock, FaCog } from 'react-icons/fa';
import AiAssistantSettings from './AiAssistantSettings';
import AiContextModal from './AiContextModal';
import { aiService } from '@services/api/ai/ai.service';
import type { PostData } from '@app-types/post';
import { Utils } from '@services/utils/utils.service';
import { toggleGifModal } from '@redux/reducers/modal/modal.reducer';
import ModerationModal from './ModerationModal';
import BestTimeModal from './BestTimeModal';

interface ModalBoxSelectionProps {
  setSelectedImage: (image: File) => void;
  isBackgroundSelected?: boolean;
  caption?: string;
  selectedImage?: File | null;
  postImage?: string;
  setPostData: React.Dispatch<React.SetStateAction<PostData>>;
  setAiLoading?: (loading: boolean) => void;
}

const ModalBoxSelection = ({
  setSelectedImage,
  isBackgroundSelected,
  caption = '',
  selectedImage,
  postImage,
  setPostData,
  setAiLoading
}: ModalBoxSelectionProps) => {
  const { gifModalIsOpen, feelingsIsOpen } = useSelector((state: RootState) => state.modal);
  const feelingsRef = useRef<HTMLDivElement>(null);
  const [isFeelingsOpen, setIsFeelingsOpen] = useDetectOutsideClick(feelingsRef, feelingsIsOpen);
  const { post } = useSelector((state: RootState) => state.post);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);
  const [isAiOpen, setIsAiOpen] = useDetectOutsideClick(aiRef, false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [isModerationOpen, setIsModerationOpen] = useState(false);
  const [moderationResult, setModerationResult] = useState<any>(null);
  const [moderationAdvice, setModerationAdvice] = useState('');
  const [isBestTimeOpen, setIsBestTimeOpen] = useState(false);
  const [bestTimeResult, setBestTimeResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [aiOptions, setAiOptions] = useState(() => {
    const saved = localStorage.getItem('chatty_ai_settings');
    return saved
      ? JSON.parse(saved)
      : {
          language: 'English',
          tone: 'Engaging',
          useEmoji: true
        };
  });

  useEffect(() => {
    localStorage.setItem('chatty_ai_settings', JSON.stringify(aiOptions));
  }, [aiOptions]);

  const dispatch = useDispatch<AppDispatch>();

  const handleAiAction = async (
    type: 'generate' | 'alternatives' | 'improve' | 'check' | 'advice',
    forcedContext?: string
  ) => {
    setIsAiOpen(false);
    setLoading(true);
    if (setAiLoading) setAiLoading(true);
    try {
      const currentCaption = forcedContext || caption.trim();

      if (type === 'check') {
        if (!currentCaption) {
          Utils.dispatchNotification('Please enter some text to check.', 'error', dispatch);
          setLoading(false);
          return;
        }
        const response = await aiService.checkContent({ text: currentCaption });
        setModerationResult(response.data.result);
        setIsModerationOpen(true);
        setIsAiOpen(false);

        // Fetch Gemini advice in background
        setLoadingAdvice(true);
        try {
          const adviceRes = await aiService.getModerationAdvice({
            result: response.data.result,
            text: currentCaption,
            options: aiOptions
          });
          setModerationAdvice(adviceRes.data.advice);
        } catch (err) {
          setModerationAdvice('Không thể lấy lời khuyên lúc này, nhưng hãy cẩn thận với nội dung của bạn nhé!');
        } finally {
          setLoadingAdvice(false);
        }
        return;
      }

      if (type === 'advice') {
        const postLength = currentCaption.length;
        const mediaCount = (selectedImage ? 1 : 0) + (postImage ? 1 : 0); // Simplified check
        const dayOfWeek = new Date().getDay(); // 0 is Sunday, 1 is Monday...

        const response = await aiService.getBestTime({
          post_length: postLength,
          media_count: mediaCount,
          day_of_week: dayOfWeek,
          options: aiOptions
        });

        setBestTimeResult(response.data.result);
        setIsBestTimeOpen(true);
        setIsAiOpen(false);
        return;
      }

      let body: any = { type, options: aiOptions };

      if (currentCaption) {
        body.context = currentCaption;
      } else if (selectedImage && selectedImage.type.includes('image')) {
        const imageBase64 = await ImageUtils.readAsBase64(selectedImage);
        body.image = imageBase64;
      } else if (
        postImage &&
        !postImage.includes('video') &&
        !postImage.includes('giphy') &&
        !postImage.endsWith('.gif')
      ) {
        body.image = postImage;
      } else {
        setIsContextModalOpen(true);
        setLoading(false);
        return;
      }

      const response = await aiService.generateCaption(body);
      const result = response.data.result;

      updatePostText(result);

      setIsAiOpen(false);
      setIsContextModalOpen(false);
    } catch (error: any) {
      console.error('AI action error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to get AI assistance';
      Utils.dispatchNotification(errorMsg, 'error', dispatch);
    } finally {
      setLoading(false);
      if (setAiLoading) setAiLoading(false);
    }
  };

  const updatePostText = (text: string) => {
    // If it's alternatives, it might have bullet points. For now just pick the first or clean it.
    const cleanText = text.replace(/^[•*-]\s*/, '').trim();

    setPostData((prev) => ({ ...prev, post: cleanText }));

    // Also sync the editable div
    const editable = document.getElementById('editable');
    if (editable) {
      editable.textContent = cleanText;
    }
  };

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
              <div className={`relative group ${loading ? 'pointer-events-none opacity-50' : ''}`}>
                <div
                  className="p-2 rounded-full hover:bg-[#f2f3f5] transition-colors cursor-pointer"
                  onClick={loading ? undefined : fileInputClicked}
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
              <div className={`relative group ${loading ? 'pointer-events-none opacity-50' : ''}`}>
                <div
                  className="p-2 rounded-full hover:bg-[#f2f3f5] transition-colors cursor-pointer"
                  onClick={() => !loading && dispatch(toggleGifModal(!gifModalIsOpen))}
                >
                  <img src={gif} alt="" className="w-6 h-6" />
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#e4e6eb] text-[#050505] text-[12px] rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-medium">
                  GIF
                </div>
              </div>
            )}

            {/* Feeling Item */}
            <div className={`relative group ${loading ? 'pointer-events-none opacity-50' : ''}`} ref={feelingsRef}>
              <div
                className="p-2 rounded-full hover:bg-[#f2f3f5] transition-colors cursor-pointer"
                onClick={() => !loading && setIsFeelingsOpen(!isFeelingsOpen)}
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

            {/* AI Item */}
            <div className={`relative group ${loading ? 'pointer-events-none' : ''}`} ref={aiRef}>
              <div
                className={`p-2 rounded-full transition-all cursor-pointer ${
                  isAiOpen ? 'bg-blue-50 text-blue-600 shadow-inner' : 'hover:bg-[#f2f3f5] text-[#65676b]'
                } ${loading ? 'opacity-50' : ''}`}
                onClick={() => !loading && setIsAiOpen(!isAiOpen)}
              >
                <FaRobot size={22} className={isAiOpen ? 'animate-pulse' : ''} />
              </div>

              {isAiOpen && (
                <div className="absolute bottom-full right-0 mb-4 z-1000 w-[280px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-[#f0f2f5] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="px-4 py-3 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-[#f0f2f5] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
                        <FaRobot className="text-white text-[12px]" />
                      </div>
                      <span className="font-black text-[13px] text-blue-900 uppercase tracking-tighter">
                        AI Assistant
                      </span>
                    </div>
                    <FaCog
                      className={`text-gray-400 cursor-pointer hover:rotate-90 transition-transform ${isSettingsOpen ? 'text-blue-600' : ''}`}
                      onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    />
                  </div>

                  {isSettingsOpen ? (
                    <AiAssistantSettings
                      options={aiOptions}
                      setOptions={setAiOptions}
                      onClose={() => setIsSettingsOpen(false)}
                    />
                  ) : (
                    <div className="p-1.5">
                      {[
                        {
                          type: (caption.trim().length > 0 ? 'alternatives' : 'generate') as
                            | 'generate'
                            | 'alternatives'
                            | 'check'
                            | 'advice',
                          label: caption.trim().length > 0 ? 'Generate Alternatives' : 'Generate Caption',
                          icon: <FaPencilAlt />,
                          color: 'text-blue-500',
                          visible: true
                        },
                        {
                          type: 'improve' as const,
                          label: 'Improve Caption',
                          icon: <FaMagic />,
                          color: 'text-purple-500',
                          visible: caption.trim().length > 0
                        },
                        {
                          type: 'check' as const,
                          label: 'Content Check',
                          icon: <FaShieldAlt />,
                          color: 'text-green-500',
                          visible: caption.trim().length > 0
                        },
                        {
                          type: 'advice' as const,
                          label: 'Best Time to Post',
                          icon: <FaClock />,
                          color: 'text-orange-500',
                          visible: true
                        }
                      ]
                        .filter((item) => item.visible)
                        .map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f2f3f5] cursor-pointer transition-all group"
                            onClick={() => !loading && item.type && handleAiAction(item.type)}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg bg-[#f8f9fa] flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}
                            >
                              {loading && item.type ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                item.icon
                              )}
                            </div>
                            <span className="text-[14px] font-bold text-gray-800 tracking-tight">{item.label}</span>
                          </div>
                        ))}
                    </div>
                  )}

                  <div className="px-4 py-2 bg-gray-50 border-t border-[#f0f2f5]">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
                      Powered by ChattyAI
                    </p>
                  </div>
                </div>
              )}

              {isModerationOpen && moderationResult && (
                <ModerationModal
                  loading={loadingAdvice}
                  result={moderationResult}
                  advice={moderationAdvice}
                  onClose={() => {
                    setIsModerationOpen(false);
                    setModerationResult(null);
                    setModerationAdvice('');
                  }}
                />
              )}

              {isBestTimeOpen && bestTimeResult && (
                <BestTimeModal
                  recommendedHour={bestTimeResult.recommended_hour}
                  advice={bestTimeResult.advice}
                  onClose={() => {
                    setIsBestTimeOpen(false);
                    setBestTimeResult(null);
                  }}
                />
              )}

              {isContextModalOpen && (
                <AiContextModal
                  loading={loading}
                  onClose={() => setIsContextModalOpen(false)}
                  onGenerate={(desc) => handleAiAction('generate', desc)}
                />
              )}

              {!isAiOpen && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#1877f2] text-white text-[12px] rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-bold">
                  AI Assistant
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
