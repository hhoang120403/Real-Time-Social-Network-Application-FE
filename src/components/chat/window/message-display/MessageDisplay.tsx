import { timeAgo } from '@services/utils/timeago.utils';
import RightMessageDisplay from '@components/chat/window/message-display/right-message-display/RightMessageDisplay';
import { useRef, useState } from 'react';
import useDetectOutsideClick from '@hooks/useDetectOutsideClick';
import useChatScrollToBottom from '@hooks/useChatScrollToBottom';
import ImageModal from '@components/image-modal/ImageModal';
import Dialog from '@components/dialog/Dialog';
import LeftMessageDisplay from '@components/chat/window/message-display/left-message/LeftMessageDisplay';
import { useSearchParams } from 'react-router-dom';

interface MessageDisplayProps {
  chatMessages: any[];
  profile: any;
  updateMessageReaction: (body: any) => void;
  deleteChatMessage: (senderId: string, receiverId: string, messageId: string, type: string) => void;
  onEditMessage?: (chat: any) => void;
}

const MessageDisplay = ({
  chatMessages,
  profile,
  updateMessageReaction,
  deleteChatMessage,
  onEditMessage
}: MessageDisplayProps) => {
  const [imageUrl, setImageUrl] = useState('');
  const [showReactionIcon, setShowReactionIcon] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeElementIndex, setActiveElementIndex] = useState<number | null>(null);
  const [selectedReaction, setSelectedReaction] = useState<any>(null);
  const reactionRef = useRef(null);
  const [toggleReaction, setToggleReaction] = useDetectOutsideClick(reactionRef, false);
  const [searchParams] = useSearchParams();
  const scrollRef = useChatScrollToBottom(chatMessages, searchParams.get('scrollToBottom'));

  const showReactionIconOnHover = (show: boolean, index: number) => {
    if (index === activeElementIndex || !activeElementIndex) {
      setShowReactionIcon(show);
    }
  };

  const handleReactionClick = (body: any) => {
    updateMessageReaction(body);
    setSelectedReaction(null);
  };

  const deleteMessage = (message: any, type: string) => {
    deleteChatMessage(message.senderId, message.receiverId, message._id, type);
  };

  return (
    <>
      {showImageModal && (
        <ImageModal image={`${imageUrl}`} onCancel={() => setShowImageModal(!showImageModal)} showArrow={false} />
      )}
      {selectedReaction && (
        <Dialog
          title="Do you want to remove your reaction?"
          showButtons={true}
          firstButtonText="Remove"
          secondButtonText="Cancel"
          firstBtnHandler={() => handleReactionClick(selectedReaction)}
          secondBtnHandler={() => setSelectedReaction(null)}
        />
      )}
      <div
        className="h-full flex-1 overflow-y-auto px-4 py-5 font-medium [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden"
        ref={scrollRef}
        data-testid="message-page"
      >
        <div className="flex flex-col min-h-full">
          {chatMessages.map((chat, index) => (
            <div
              key={chat?._id || `${chat?.conversationId}-${chat?.createdAt}-${index}`}
              className="py-1.5"
              data-testid="message-chat"
            >
              {(index === 0 ||
                timeAgo.dayMonthYear(chat.createdAt) !== timeAgo.dayMonthYear(chatMessages[index - 1].createdAt)) && (
                <div className="my-4 flex justify-center">
                  <div
                    className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-center text-[12px] font-bold text-slate-500 shadow-sm backdrop-blur"
                    data-testid="message-chat-date"
                  >
                    {timeAgo.chatMessageTransform(chat.createdAt)}
                  </div>
                </div>
              )}
              {(chat.receiverUsername === profile?.username || chat.senderUsername === profile?.username) && (
                <>
                  {chat.senderUsername === profile?.username && (
                    <RightMessageDisplay
                      chat={chat}
                      lastChatMessage={chatMessages[chatMessages.length - 1]}
                      profile={profile}
                      toggleReaction={toggleReaction}
                      showReactionIcon={showReactionIcon}
                      index={index}
                      activeElementIndex={activeElementIndex}
                      reactionRef={reactionRef}
                      setToggleReaction={setToggleReaction}
                      handleReactionClick={handleReactionClick}
                      deleteMessage={deleteMessage}
                      showReactionIconOnHover={showReactionIconOnHover}
                      setActiveElementIndex={setActiveElementIndex}
                      setShowImageModal={setShowImageModal}
                      setImageUrl={setImageUrl}
                      showImageModal={showImageModal}
                      setSelectedReaction={setSelectedReaction}
                      onEditMessage={onEditMessage}
                    />
                  )}

                  {chat.receiverUsername === profile?.username && (
                    <LeftMessageDisplay
                      chat={chat}
                      profile={profile}
                      toggleReaction={toggleReaction}
                      showReactionIcon={showReactionIcon}
                      index={index}
                      activeElementIndex={activeElementIndex}
                      reactionRef={reactionRef}
                      setToggleReaction={setToggleReaction}
                      handleReactionClick={handleReactionClick}
                      deleteMessage={deleteMessage}
                      showReactionIconOnHover={showReactionIconOnHover}
                      setActiveElementIndex={setActiveElementIndex}
                      setShowImageModal={setShowImageModal}
                      setImageUrl={setImageUrl}
                      showImageModal={showImageModal}
                      setSelectedReaction={setSelectedReaction}
                    />
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MessageDisplay;
