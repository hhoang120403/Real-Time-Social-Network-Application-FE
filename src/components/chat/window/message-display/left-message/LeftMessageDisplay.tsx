import Avatar from '@components/avatar/Avatar';
import Reactions from '@components/posts/reactions/Reaction';
import { reactionsMap } from '@services/utils/static.data';
import { timeAgo } from '@services/utils/timeago.utils';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';

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
    <Box className="group/msg flex w-full justify-start" data-testid="left-message">
      <Box className="relative flex max-w-[85%] items-start gap-3 lg:max-w-[75%]">
        <Box className="absolute -top-8 left-12 z-10">
          {toggleReaction && index === activeElementIndex && (
            <div ref={index === activeElementIndex ? reactionRef : null} className="animate-in fade-in zoom-in-95 duration-200">
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
        </Box>

        <Box className="shrink-0 pt-1">
          <Avatar
            name={chat.senderUsername}
            bgColor={chat.senderAvatarColor}
            textColor="#ffffff"
            size={40}
            avatarSrc={chat.senderProfilePicture}
          />
        </Box>

        <Box className="flex min-w-0 flex-col">
          <Box className="flex items-center gap-2">
            <Box
              className="min-w-0"
              onClick={() => {
                if (!chat?.deleteForEveryone) {
                  deleteMessage(chat, 'deleteForMe');
                }
              }}
              onMouseEnter={() => {
                if (!chat?.deleteForEveryone) {
                  showReactionIconOnHover(true, index);
                  setActiveElementIndex(index);
                }
              }}
            >
              <Box className="relative">
                {chat?.deleteForEveryone && (
                  <Box className="rounded-[18px] rounded-bl-md border border-slate-200 bg-slate-50 px-4 py-2 shadow-sm">
                    <Typography className="text-[14px] italic text-slate-400">message deleted</Typography>
                  </Box>
                )}
 
                {!chat?.deleteForEveryone && (
                  <>
                    {chat?.body !== 'Sent a GIF' && chat?.body !== 'Sent an Image' && (
                      <Box className="rounded-[18px] rounded-bl-md border border-slate-200 bg-white px-4 py-2.5 text-left shadow-sm">
                        <Typography className="whitespace-pre-wrap wrap-break-word text-[15px] font-medium leading-relaxed text-slate-800">
                          {chat?.body}
                        </Typography>
                      </Box>
                    )}
                    {chat?.selectedImage && (
                      <Box
                        className={`overflow-hidden rounded-[18px] rounded-bl-md shadow-sm ${
                          chat?.body && chat?.body !== 'Sent an Image' ? 'mt-1' : ''
                        }`}
                      >
                        <img
                          src={chat?.selectedImage}
                          className="max-h-[300px] max-w-full cursor-pointer object-cover transition-opacity hover:opacity-95"
                          onClick={() => {
                            setImageUrl(chat?.selectedImage);
                            setShowImageModal(!showImageModal);
                          }}
                          alt=""
                        />
                      </Box>
                    )}
                    {chat?.gifUrl && (
                      <Box className="mt-1 overflow-hidden rounded-[18px] rounded-bl-md shadow-sm">
                        <img src={chat?.gifUrl} className="max-h-[300px] max-w-full object-contain" alt="" />
                      </Box>
                    )}
                  </>
                )}

                {chat?.reaction && chat.reaction.length > 0 && !chat?.deleteForEveryone && (
                  <Box className="absolute -bottom-3 left-3 flex w-fit items-center rounded-full border border-slate-100 bg-white px-1.5 py-0.5 shadow-md z-10 hover:scale-110 transition-transform cursor-pointer">
                    {Array.from(new Set(chat.reaction.map((r: any) => r.type))).map((reactionType: any, i: number) => (
                      <img
                        src={reactionsMap[reactionType as keyof typeof reactionsMap]}
                        alt=""
                        key={i}
                        className="h-4 w-4 cursor-pointer rounded-full -ml-1 first:ml-0 border border-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          const myReaction = chat.reaction.find((r: any) => r.senderName === profile?.username);
                          if (myReaction) {
                            const body = {
                              conversationId: chat?.conversationId,
                              messageId: chat?._id,
                              reaction: myReaction.type,
                              type: 'remove'
                            };
                            setSelectedReaction(body);
                          }
                        }}
                      />
                    ))}
                    {chat?.reaction?.length > 1 && (
                      <span className="ml-1 text-[11px] font-bold text-slate-500 px-0.5">
                        {chat?.reaction?.length}
                      </span>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
            {showReactionIcon && index === activeElementIndex && !chat?.deleteForEveryone && (
              <Tooltip title="React" placement="top">
                <IconButton
                  size="small"
                  className="h-8 w-8 border border-slate-100 bg-white text-slate-500 opacity-0 shadow-sm transition-opacity hover:bg-slate-50 hover:text-blue-600 group-hover/msg:opacity-100"
                  onClick={() => {
                    setActiveElementIndex(index);
                    setToggleReaction(true);
                  }}
                >
                  <span className="text-[17px] leading-none">&#9786;</span>
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Box className={`${chat?.reaction?.length > 0 ? 'mt-4' : 'mt-1'} px-1`}>
            <Typography
              data-testid="chat-time"
              sx={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, lineHeight: '16px' }}
            >
              {timeAgo.timeFormat(chat?.createdAt)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LeftMessageDisplay;
