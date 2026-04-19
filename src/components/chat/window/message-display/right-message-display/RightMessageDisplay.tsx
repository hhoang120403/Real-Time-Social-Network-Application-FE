import doubleCheckmark from '@assets/images/double-checkmark.png';
import Reactions from '@components/posts/reactions/Reaction';
import { reactionsMap } from '@services/utils/static.data';
import { timeAgo } from '@services/utils/timeago.utils';
import { Box, IconButton, ListItemText, Menu, MenuItem, Tooltip, Typography, Zoom, Fade } from '@mui/material';
import { useState } from 'react';
import { FaEdit, FaEllipsisV, FaUndoAlt } from 'react-icons/fa';

interface RightMessageDisplayProps {
  chat: any;
  lastChatMessage: any;
  profile: any;
  toggleReaction: boolean;
  showReactionIcon: boolean;
  index: number;
  activeElementIndex: number | null;
  reactionRef: any;
  setToggleReaction: (toggleReaction: boolean) => void;
  handleReactionClick: (body: any) => void;
  deleteMessage: (chat: any, type: string) => void;
  showReactionIconOnHover: (showReactionIcon: boolean, index: number) => void;
  setActiveElementIndex: (activeElementIndex: number) => void;
  setSelectedReaction: (selectedReaction: any) => void;
  setShowImageModal: (showImageModal: boolean) => void;
  setImageUrl: (imageUrl: string) => void;
  showImageModal: boolean;
  onEditMessage?: (chat: any) => void;
}

import UnsendModal from '@components/chat/window/message-display/UnsendModal';

const RightMessageDisplay = ({
  chat,
  lastChatMessage,
  profile,
  toggleReaction,
  index,
  activeElementIndex,
  reactionRef,
  setToggleReaction,
  handleReactionClick,
  deleteMessage,
  setActiveElementIndex,
  setSelectedReaction,
  setShowImageModal,
  setImageUrl,
  showImageModal,
  onEditMessage
}: RightMessageDisplayProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [unsendModalOpen, setUnsendModalOpen] = useState(false);
  const [unsendOption, setUnsendOption] = useState<'deleteForEveryone' | 'deleteForMe'>('deleteForEveryone');
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUnsendClick = () => {
    handleMenuClose();
    setUnsendModalOpen(true);
  };

  const handleUnsendConfirm = (option: 'deleteForEveryone' | 'deleteForMe') => {
    deleteMessage(chat, option);
    setUnsendModalOpen(false);
  };

  const handleEditClick = () => {
    handleMenuClose();
    if (onEditMessage) {
      onEditMessage(chat);
    }
  };

  return (
    <Box className="group/msg flex w-full justify-end px-4 py-0.5" data-testid="right-message">
      <Box className="relative flex max-w-[85%] flex-col items-end lg:max-w-[75%] gap-0.5">
        {/* Reaction Picker Portal */}
        <Box className="absolute -top-10 right-0 z-50">
          <Fade in={toggleReaction && index === activeElementIndex}>
            <div
              ref={index === activeElementIndex ? reactionRef : null}
              className="shadow-2xl rounded-full bg-white overflow-hidden border border-slate-100"
            >
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
          </Fade>
        </Box>

        <Box className="flex items-center justify-end gap-2 group/actions">
          {/* Action Icons Overlay - Scoped with Tailwind Group Hover */}
          {!chat?.deleteForEveryone && !chat?.deleteForMe && (
            <Box
              className={`flex items-center gap-1 transition-all duration-200 ${
                open
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-2 group-hover/actions:opacity-100 group-hover/actions:translate-x-0'
              }`}
            >
              <Tooltip title="React" placement="top" TransitionComponent={Zoom} arrow>
                <IconButton
                  size="small"
                  className="w-8 h-8 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  onClick={() => {
                    setActiveElementIndex(index);
                    setToggleReaction(true);
                  }}
                >
                  <span className="text-[17px] leading-none text-slate-500 hover:text-blue-600">☺</span>
                </IconButton>
              </Tooltip>

              <Tooltip title="More" placement="top" TransitionComponent={Zoom} arrow>
                <IconButton
                  size="small"
                  onClick={handleMenuOpen}
                  className="w-8 h-8 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
                >
                  <FaEllipsisV className="text-[10px] text-slate-500" />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          <Box className="flex flex-col items-end">
            <Box className="relative">
              {chat?.deleteForEveryone || chat?.deleteForMe ? (
                <Box className="rounded-2xl rounded-br-sm border border-slate-200 bg-slate-50/80 px-4 py-2 text-slate-400 italic text-sm">
                  message removed
                </Box>
              ) : (
                <>
                  {chat?.body && chat?.body !== 'Sent an Image' && chat?.body !== 'Sent a GIF' && (
                    <Box className="rounded-2xl rounded-br-sm bg-[#0084ff] px-4 py-2.5 text-white shadow-sm ring-1 ring-black/5 hover:bg-[#0073e6] transition-colors">
                      <Typography className="whitespace-pre-wrap wrap-break-word text-[15px] font-medium leading-relaxed">
                        {chat?.body}
                      </Typography>
                    </Box>
                  )}

                  {chat?.selectedImage && (
                    <Box className="mt-1 overflow-hidden rounded-2xl rounded-br-sm shadow-md ring-1 ring-black/5 cursor-pointer hover:opacity-95 active:scale-[98%] transition-all">
                      <img
                        src={chat?.selectedImage}
                        className="max-h-[320px] max-w-full object-cover"
                        onClick={() => {
                          setImageUrl(chat?.selectedImage);
                          setShowImageModal(!showImageModal);
                        }}
                        alt=""
                      />
                    </Box>
                  )}

                  {chat?.gifUrl && (
                    <Box className="mt-1 overflow-hidden rounded-2xl rounded-br-sm shadow-md ring-1 ring-black/5">
                      <img src={chat?.gifUrl} className="max-h-[300px] max-w-full object-contain" alt="" />
                    </Box>
                  )}
                </>
              )}

              {/* Message Reactions Stack */}
              {chat?.reaction?.length > 0 && !chat?.deleteForEveryone && !chat?.deleteForMe && (
                <Box className="absolute -bottom-3 -right-1 flex items-center bg-white rounded-full px-1.5 py-0.5 shadow-md ring-1 ring-slate-100 hover:scale-110 transition-transform cursor-pointer z-10">
                  {Array.from(new Set(chat.reaction.map((r: any) => r.type))).map((reactionType: any, i: number) => (
                    <img
                      key={i}
                      src={reactionsMap[reactionType as keyof typeof reactionsMap]}
                      alt=""
                      className="w-4 h-4 rounded-full -ml-1 first:ml-0 border border-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        const myReaction = chat.reaction.find((r: any) => r.senderName === profile?.username);
                        if (myReaction) {
                          setSelectedReaction({
                            conversationId: chat?.conversationId,
                            messageId: chat?._id,
                            reaction: myReaction.type,
                            type: 'remove'
                          });
                        }
                      }}
                    />
                  ))}
                  {chat?.reaction?.length > 1 && (
                    <span className="ml-1 text-[11px] font-bold text-slate-600 px-0.5">{chat?.reaction?.length}</span>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Message Metadata */}
        <Box className={`${chat?.reaction?.length > 0 ? 'mt-4' : 'mt-0.5'} flex items-center gap-1.5 px-0.5`}>
          <Typography sx={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, lineHeight: '16px' }}>
            {timeAgo.timeFormat(chat?.createdAt)}
          </Typography>
          {chat?.senderUsername === profile?.username && !chat?.deleteForEveryone && (
            <img
              src={doubleCheckmark}
              alt=""
              className={`w-3.5 h-3.5 transition-all ${
                chat?.isRead || lastChatMessage?.isRead ? 'opacity-100' : 'opacity-30 grayscale'
              }`}
            />
          )}
        </Box>
      </Box>

      {/* Premium Messenger-style Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        TransitionComponent={Fade}
        elevation={0}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        PaperProps={{
          className:
            'mt-2 min-w-[200px] rounded-[12px] border border-gray-100 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.12)] p-1.5 overflow-hidden'
        }}
      >
        <MenuItem
          onClick={handleEditClick}
          className="flex items-center gap-3.5 px-3 py-2.5 rounded-[8px] hover:bg-[#f2f2f2] transition-colors group"
        >
          <div className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full group-hover:bg-white transition-colors">
            <FaEdit className="text-[15px] text-gray-700" />
          </div>
          <ListItemText
            primary="Edit message"
            primaryTypographyProps={{ className: 'text-[15px] font-semibold text-gray-800' }}
          />
        </MenuItem>

        <MenuItem
          onClick={handleUnsendClick}
          className="flex items-center gap-3.5 px-3 py-2.5 rounded-[8px] hover:bg-[#f2f2f2] transition-colors group"
        >
          <div className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full group-hover:bg-white transition-colors">
            <FaUndoAlt className="text-[14px] text-gray-700" />
          </div>
          <ListItemText
            primary="Unsend"
            primaryTypographyProps={{ className: 'text-[15px] font-semibold text-gray-800' }}
          />
        </MenuItem>
      </Menu>

      {/* Premium Dark Mode Unsend Modal (Exactly as Requested) */}
      {unsendModalOpen && (
        <UnsendModal
          onClose={() => setUnsendModalOpen(false)}
          onConfirm={handleUnsendConfirm}
          option={unsendOption}
          setOption={setUnsendOption}
        />
      )}
    </Box>
  );
};

export default RightMessageDisplay;
