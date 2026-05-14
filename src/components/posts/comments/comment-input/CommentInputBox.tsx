import '@components/posts/comments/comment-input/CommentInputBox.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { Utils } from '@services/utils/utils.service';
import { cloneDeep } from 'lodash';
import { socketService } from '@services/socket/socket.service';
import { postService } from '@services/api/post/post.service';
import type { PostItem } from '@app-types/post';
import type { AppDispatch, RootState } from '@redux/store';
import type { CreateCommentPayload } from '@app-types/comments';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { FaSmile, FaPaperPlane } from 'react-icons/fa';

interface CommentInputBoxProps {
  post: PostItem;
}

const CommentInputBox = ({ post }: CommentInputBoxProps) => {
  const { profile } = useSelector((state: RootState) => state.user);
  const [comment, setComment] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();

  const submitComment = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      post = cloneDeep(post);
      post.commentsCount += 1;
      const commentBody: CreateCommentPayload = {
        userTo: post?.userId!,
        postId: post?._id!,
        comment: comment.trim(),
        commentsCount: post.commentsCount,
        profilePicture: profile?.profilePicture!
      };
      socketService?.socket?.emit('comment', commentBody);
      await postService.addComment(commentBody);
      setComment('');
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const onEmojiClick = (emojiData: any) => {
    const emoji = emojiData.emoji;
    setComment((prev) => prev + emoji);
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
        setIsEmojiPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (commentInputRef?.current) {
      commentInputRef.current.focus();
    }
  }, []);

  return (
    <div className="comment-container" data-testid="comment-input">
      <form className="comment-form" onSubmit={submitComment}>
        <div className="comment-input-wrapper">
          <div className="comment-actions-left">
            <div className="relative" ref={emojiRef}>
              <FaSmile
                className={`comment-icon smile ${isEmojiPickerOpen ? 'active' : ''}`}
                onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
              />
              {isEmojiPickerOpen && (
                <div className="comment-emoji-picker">
                  <EmojiPicker
                    onEmojiClick={onEmojiClick}
                    autoFocusSearch={false}
                    theme={Theme.LIGHT}
                    width={300}
                    height={400}
                  />
                </div>
              )}
            </div>
          </div>
          <input
            ref={commentInputRef}
            name="comment"
            type="text"
            value={comment}
            className="comment-input"
            placeholder="Write a comment..."
            onChange={(event) => setComment(event.target.value)}
          />
          <div className="comment-actions-right">
            <button type="submit" disabled={!comment.trim()} className="comment-submit-btn">
              <FaPaperPlane className={`comment-icon send ${comment.trim() ? 'active' : ''}`} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CommentInputBox;
