import Avatar from '@components/avatar/Avatar';
import Reactions from '@components/posts/reactions/Reaction';
import { reactionsMap } from '@services/utils/static.data';
import { timeAgo } from '@services/utils/timeago.utils';

interface LeftMessageDisplayProps {
  chat: any;
  profile: any;
  toggleReaction: boolean;
  showReactionIcon: boolean;
  index: number;
  activeElementIndex: number | null;
  reactionRef: any;
  setToggleReaction: (value: boolean) => void;
  handleReactionClick: (body: any) => void;
  deleteMessage: (chat: any, type: string) => void;
  showReactionIconOnHover: (value: boolean, index: number) => void;
  setActiveElementIndex: (index: number) => void;
  setSelectedReaction: (body: any) => void;
  setShowImageModal: (value: boolean) => void;
  showImageModal: boolean;
  setImageUrl: (url: string) => void;
}

const LeftMessageDisplay = ({
  chat,
  profile,
  toggleReaction,
  showReactionIcon,
  index,
  activeElementIndex,
  reactionRef,
  setToggleReaction,
  handleReactionClick,
  deleteMessage,
  showReactionIconOnHover,
  setActiveElementIndex,
  setSelectedReaction,
  setShowImageModal,
  setImageUrl,
  showImageModal
}: LeftMessageDisplayProps) => {
  return (
    <div className="message left-message" data-testid="left-message">
      <div className="message-reactions-container">
        {toggleReaction && index === activeElementIndex && (
          <div ref={reactionRef}>
            <Reactions
              showLabel={false}
              handleClick={(event) => {
                const body = {
                  conversationId: chat?.conversationId,
                  messageId: chat?._id,
                  reaction: event,
                  type: 'add'
                };
                handleReactionClick(body);
                setToggleReaction(false);
              }}
            />
          </div>
        )}
      </div>
      <div className="left-message-bubble-container">
        <div className="message-img">
          <Avatar
            name={chat.senderUsername}
            bgColor={chat.senderAvatarColor}
            textColor="#ffffff"
            size={40}
            avatarSrc={chat.senderProfilePicture}
          />
        </div>
        <div className="message-content-container">
          <div className="message-content-container-wrapper">
            <div
              className="message-content"
              onClick={() => {
                if (!chat?.deleteForMe) {
                  deleteMessage(chat, 'deleteForMe');
                }
              }}
              onMouseEnter={() => {
                if (!chat?.deleteForMe) {
                  showReactionIconOnHover(true, index);
                  setActiveElementIndex(index);
                }
              }}
            >
              {chat?.deleteForMe && chat?.receiverUsername === profile?.username && (
                <div className="message-bubble left-message-bubble">
                  <span className="message-deleted">message deleted</span>
                </div>
              )}

              {!chat?.deleteForMe && (
                <>
                  {chat?.body !== 'Sent a GIF' && chat?.body !== 'Sent an Image' && (
                    <div className="message-bubble left-message-bubble">{chat?.body}</div>
                  )}
                  {chat?.selectedImage && (
                    <div
                      className="message-image"
                      style={{
                        marginTop: `${chat?.body && chat?.body !== 'Sent an Image' ? '5px' : ''}`
                      }}
                    >
                      <img
                        src={chat?.selectedImage}
                        onClick={() => {
                          setImageUrl(chat?.selectedImage);
                          setShowImageModal(!showImageModal);
                        }}
                        alt=""
                      />
                    </div>
                  )}
                  {chat?.gifUrl && (
                    <div className="message-gif">
                      <img src={chat?.gifUrl} alt="" />
                    </div>
                  )}
                </>
              )}
            </div>
            {showReactionIcon && index === activeElementIndex && !chat?.deleteForMe && (
              <div className="message-content-emoji-container" onClick={() => setToggleReaction(true)}>
                &#9786;
              </div>
            )}
          </div>
          {chat?.reaction && chat.reaction.length > 0 && !chat?.deleteForMe && (
            <div className="message-reaction">
              {chat?.reaction.map((data: any, index: number) => (
                <img
                  src={reactionsMap[data?.type as keyof typeof reactionsMap]}
                  alt=""
                  key={index}
                  onClick={() => {
                    if (data?.senderName === profile?.username) {
                      const body = {
                        conversationId: chat?.conversationId,
                        messageId: chat?._id,
                        reaction: data?.type,
                        type: 'remove'
                      };
                      setSelectedReaction(body);
                    }
                  }}
                />
              ))}
            </div>
          )}
          <div className="message-time">
            <span data-testid="chat-time">{timeAgo.timeFormat(chat?.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftMessageDisplay;
