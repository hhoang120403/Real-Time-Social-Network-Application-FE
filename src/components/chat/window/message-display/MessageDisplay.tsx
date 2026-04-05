import '@components/chat/window/message-display/MessageDisplay.scss';
import { timeAgo } from '@services/utils/timeago.utils';
import { Utils } from '@services/utils/utils.service';
import RightMessageDisplay from '@components/chat/window/message-display/right-message-display/RightMessageDisplay';
import { useRef, useState } from 'react';
import useDetectOutsideClick from '@hooks/useDetectOutsideClick';
import useChatScrollToBottom from '@hooks/useChatScrollToBottom';
import ImageModal from '@components/image-modal/ImageModal';
import Dialog from '@components/dialog/Dialog';
import LeftMessageDisplay from '@components/chat/window/message-display/left-message/LeftMessageDisplay';

interface MessageDisplayProps {
  chatMessages: any[];
  profile: any;
  updateMessageReaction: (body: any) => void;
  deleteChatMessage: (senderId: string, receiverId: string, messageId: string, type: string) => void;
}

const MessageDisplay = ({ chatMessages, profile, updateMessageReaction, deleteChatMessage }: MessageDisplayProps) => {
  const [imageUrl, setImageUrl] = useState('');
  const [showReactionIcon, setShowReactionIcon] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    message: null,
    type: ''
  });
  const [activeElementIndex, setActiveElementIndex] = useState<number | null>(null);
  const [selectedReaction, setSelectedReaction] = useState<any>(null);
  const reactionRef = useRef(null);
  const [toggleReaction, setToggleReaction] = useDetectOutsideClick(reactionRef, false);
  const scrollRef = useChatScrollToBottom(chatMessages);

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
    setDeleteDialog({
      open: true,
      message,
      type
    });
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
      {deleteDialog.open && (
        <Dialog
          title="Delete message?"
          showButtons={true}
          firstButtonText={`${deleteDialog.type === 'deleteForMe' ? 'DELETE FOR ME' : 'DELETE FOR EVERYONE'}`}
          secondButtonText="CANCEL"
          firstBtnHandler={() => {
            const { message, type } = deleteDialog;
            if (!message) return;

            deleteChatMessage((message as any).senderId, (message as any).receiverId, (message as any)._id, type);

            setDeleteDialog({
              open: false,
              message: null,
              type: ''
            });
          }}
          secondBtnHandler={() => {
            setDeleteDialog({
              open: false,
              message: null,
              type: ''
            });
          }}
        />
      )}
      <div className="message-page" ref={scrollRef} data-testid="message-page">
        {chatMessages.map((chat, index) => (
          <div key={Utils.generateString(10)} className="message-chat" data-testid="message-chat">
            {(index === 0 ||
              timeAgo.dayMonthYear(chat.createdAt) !== timeAgo.dayMonthYear(chatMessages[index - 1].createdAt)) && (
              <div className="message-date-group">
                <div className="message-chat-date" data-testid="message-chat-date">
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
    </>
  );
};

export default MessageDisplay;
