import Avatar from '@components/avatar/Avatar';
import ReactionWrapper from '@components/posts/modal-wrappers/reaction-wrapper/ReactionWrapper';
import { Utils } from '@services/utils/utils.service';
import { timeAgo } from '@services/utils/timeago.utils';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@redux/store';
import { useEffect, useRef, useState } from 'react';
import { postService } from '@services/api/post/post.service';
import useEffectOnce from '@hooks/useEffectOnce';
import { closeModal, toggleGifModal } from '@redux/reducers/modal/modal.reducer';
import { clearPost, updatePostItem } from '@redux/reducers/post/post.reducer';
import type { CreateCommentPayload } from '@app-types/comments';
import type { Reaction, ReactionType } from '@app-types/reaction';
import { socketService } from '@services/socket/socket.service';
import { reactionsColor, reactionsMap } from '@services/utils/static.data';
import {
  FaRobot,
  FaMagic,
  FaPencilAlt,
  FaShieldAlt,
  FaCog,
  FaEllipsisH,
  FaEdit,
  FaTrashAlt,
  FaTimes,
  FaSmile,
  FaImage,
  FaPaperPlane
} from 'react-icons/fa';
import { aiService } from '@services/api/ai/ai.service';
import ModerationModal from '@components/posts/post-modal/modal-box-content/ModerationModal';
import AiAssistantSettings from '@components/posts/post-modal/modal-box-content/AiAssistantSettings';
import { ImageUtils } from '@services/utils/image-utils.service';
import Reactions from '@components/posts/reactions/Reaction';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import Giphy from '@components/giphy/Giphy';
import { MdGif } from 'react-icons/md';

const emptyReactions = (): Reaction => ({
  like: 0,
  love: 0,
  happy: 0,
  angry: 0,
  sad: 0,
  wow: 0
});

const getReactionTextColor = (reaction: string) =>
  reactionsColor[reaction as keyof typeof reactionsColor] || 'var(--primary-1)';

interface CommentsModalProps {
  setPosts?: React.Dispatch<React.SetStateAction<any[]>>;
}

const CommentsModal = ({ setPosts }: CommentsModalProps) => {
  const { post, user } = useSelector((state: RootState) => state);
  const profile = user.profile;
  const [postComments, setPostComments] = useState<any[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const [editingComment, setEditingComment] = useState<any | null>(null);
  const [editingReply, setEditingReply] = useState<{ comment: any; reply: any } | null>(null);
  const [activeCommentMenuId, setActiveCommentMenuId] = useState<string | null>(null);
  const [activeReplyMenuId, setActiveReplyMenuId] = useState<string | null>(null);
  const [activeReactionCommentId, setActiveReactionCommentId] = useState<string | null>(null);
  const [activeReactionReplyId, setActiveReactionReplyId] = useState<string | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();

  const { gifUrl } = useSelector((state: RootState) => state.post);
  const { gifModalIsOpen } = useSelector((state: RootState) => state.modal);

  const aiRef = useRef<HTMLDivElement>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModerationOpen, setIsModerationOpen] = useState(false);
  const [moderationResult, setModerationResult] = useState<any>(null);
  const [moderationAdvice, setModerationAdvice] = useState('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [aiOptions, setAiOptions] = useState(() => {
    const saved = localStorage.getItem('chatty_ai_settings');
    return saved ? JSON.parse(saved) : { language: 'English', tone: 'Engaging', useEmoji: true };
  });

  const getPostComments = async () => {
    try {
      const response = await postService.getPostComments(post?._id);
      const comments = response?.data?.comments || [];
      setPostComments(
        [...comments].sort((a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime())
      );
      setCommentsLoaded(true);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const closeCommentsModal = () => {
    dispatch(closeModal());
    dispatch(clearPost());
  };

  const syncPostCommentsCount = (commentsCount: number) => {
    if (!post?._id) return;

    dispatch(updatePostItem({ commentsCount }));
    setPosts?.((prevPosts) =>
      prevPosts.map((item) => (String(item?._id) === String(post._id) ? { ...item, commentsCount } : item))
    );
    socketService?.socket?.emit('comment', {
      postId: post._id,
      commentsCount
    });
  };

  const updateCommentInList = (commentId: string, updater: (comment: any) => any) => {
    setPostComments((comments) =>
      comments.map((item) => (String(item?._id) === String(commentId) ? updater(item) : item))
    );
  };

  const getUserCommentReaction = (data: any) =>
    (data?.reactionList || []).find((reaction: any) => reaction?.username === profile?.username);

  const getCommentReactionCount = (data: any) =>
    Object.values(data?.reactions || {}).reduce((total: number, value: any) => total + Number(value || 0), 0);

  const getUserReplyReaction = (reply: any) =>
    (reply?.reactionList || []).find((reaction: any) => reaction?.username === profile?.username);

  const getReplyReactionCount = (reply: any) =>
    Object.values(reply?.reactions || {}).reduce((total: number, value: any) => total + Number(value || 0), 0);

  const normalizeId = (value: any) => String(value?._id || value || '');
  const isCommentOwner = (data: any) =>
    normalizeId(data?.userFrom) === normalizeId(profile?._id) ||
    (!data?.userFrom && data?.username === profile?.username);
  const isPostOwner = (data: any) => normalizeId(data?.userTo || post?.userId) === normalizeId(profile?._id);
  const canEditComment = (data: any) => isCommentOwner(data);
  const canDeleteComment = (data: any) => isCommentOwner(data) || isPostOwner(data);
  const isReplyOwner = (reply: any) =>
    normalizeId(reply?.userFrom) === normalizeId(profile?._id) ||
    (!reply?.userFrom && reply?.username === profile?.username);
  const canEditReply = (reply: any) => isReplyOwner(reply);
  const canDeleteReply = (commentData: any, reply: any) =>
    isReplyOwner(reply) || isCommentOwner(commentData) || isPostOwner(commentData);

  const addCommentReaction = async (data: any, reaction: ReactionType) => {
    if (!profile) return;
    if (String(data._id).startsWith('local-')) {
      Utils.dispatchNotification('Please wait for the comment to finish uploading.', 'warning', dispatch);
      return;
    }
    setActiveReactionCommentId(null);

    const previousReaction = getUserCommentReaction(data)?.type || '';
    const reactions = { ...emptyReactions(), ...(data?.reactions || {}) };
    const reactionList = (data?.reactionList || []).filter((item: any) => item?.username !== profile.username);

    if (previousReaction && reactions[previousReaction as ReactionType] > 0) {
      reactions[previousReaction as ReactionType] -= 1;
    }

    if (previousReaction !== reaction) {
      reactions[reaction] = (reactions[reaction] || 0) + 1;
      reactionList.push({
        username: profile.username,
        avatarColor: profile.avatarColor,
        profilePicture: profile.profilePicture,
        type: reaction,
        createdAt: new Date().toISOString()
      });
    }

    updateCommentInList(data._id, (commentItem) => ({
      ...commentItem,
      reactions,
      reactionList
    }));

    try {
      const response = await postService.addCommentReaction({
        postId: post._id,
        commentId: data._id,
        type: reaction,
        previousReaction,
        profilePicture: profile.profilePicture
      });

      if (response?.data?.comment) {
        updateCommentInList(data._id, () => response.data.comment);
      }
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message || 'Failed to react to comment', 'error', dispatch);
      getPostComments();
    }
  };

  const addReplyReaction = async (commentData: any, replyData: any, reaction: ReactionType) => {
    if (!profile) return;
    if (String(replyData._id).startsWith('local-')) {
      Utils.dispatchNotification('Please wait for the reply to finish uploading.', 'warning', dispatch);
      return;
    }
    setActiveReactionReplyId(null);

    const previousReaction = getUserReplyReaction(replyData)?.type || '';
    const reactions = { ...emptyReactions(), ...(replyData?.reactions || {}) };
    const reactionList = (replyData?.reactionList || []).filter((item: any) => item?.username !== profile.username);

    if (previousReaction && reactions[previousReaction as ReactionType] > 0) {
      reactions[previousReaction as ReactionType] -= 1;
    }

    if (previousReaction !== reaction) {
      reactions[reaction] = (reactions[reaction] || 0) + 1;
      reactionList.push({
        username: profile.username,
        avatarColor: profile.avatarColor,
        profilePicture: profile.profilePicture,
        type: reaction,
        createdAt: new Date().toISOString()
      });
    }

    updateCommentInList(commentData._id, (commentItem) => ({
      ...commentItem,
      replies: (commentItem?.replies || []).map((reply: any) =>
        String(reply?._id) === String(replyData?._id) ? { ...reply, reactions, reactionList } : reply
      )
    }));

    try {
      const response = await postService.addCommentReplyReaction({
        postId: post._id,
        commentId: commentData._id,
        replyId: replyData._id,
        type: reaction,
        previousReaction,
        profilePicture: profile.profilePicture
      });

      if (response?.data?.comment) {
        updateCommentInList(commentData._id, () => response.data.comment);
      }
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message || 'Failed to react to reply', 'error', dispatch);
      getPostComments();
    }
  };

  const submitReply = async () => {
    if (!replyingTo || !profile || isSubmitting) return;
    const canSubmit = comment.trim() || selectedImage || gifUrl;
    if (!canSubmit) return;

    const previousCommentsCount = Number(post.commentsCount || 0);
    const nextCommentsCount = previousCommentsCount + 1;

    try {
      setIsSubmitting(true);
      const optimisticReply = {
        _id: `local-reply-${Date.now()}`,
        username: profile.username,
        avatarColor: profile.avatarColor,
        profilePicture: profile.profilePicture,
        comment: comment.trim(),
        image: selectedImage,
        gifUrl,
        userFrom: profile._id,
        reactions: emptyReactions(),
        reactionList: [],
        createdAt: new Date().toISOString()
      };

      const response = await postService.addCommentReply({
        postId: post._id,
        commentId: replyingTo._id,
        comment: comment.trim(),
        image: selectedImage || '',
        gifUrl: gifUrl || '',
        profilePicture: profile.profilePicture
      });

      if (response?.data?.comment) {
        updateCommentInList(replyingTo._id, () => response.data.comment);
      } else {
        // Fallback: update with optimistic if response doesn't have comment
        updateCommentInList(replyingTo._id, (commentItem) => ({
          ...commentItem,
          replies: [...(commentItem?.replies || []), optimisticReply]
        }));
      }
      syncPostCommentsCount(nextCommentsCount);

      setComment('');
      setSelectedImage(null);
      setReplyingTo(null);
      dispatch(updatePostItem({ gifUrl: '' }));
    } catch (error: any) {
      syncPostCommentsCount(previousCommentsCount);
      Utils.dispatchNotification(error.response?.data?.message || 'Failed to post reply', 'error', dispatch);
      getPostComments();
    } finally {
      setIsSubmitting(false);
      window.setTimeout(() => commentInputRef.current?.focus(), 0);
    }
  };

  const submitEditComment = async () => {
    if (!editingComment || !profile || isSubmitting || !comment.trim()) return;

    try {
      setIsSubmitting(true);
      updateCommentInList(editingComment._id, (commentItem) => ({
        ...commentItem,
        comment: comment.trim()
      }));

      const response = await postService.editComment(post._id, editingComment._id, {
        comment: comment.trim()
      });

      if (response?.data?.comment) {
        updateCommentInList(editingComment._id, () => response.data.comment);
      }

      setComment('');
      setEditingComment(null);
    } catch (error: any) {
      updateCommentInList(editingComment._id, (commentItem) => ({
        ...commentItem,
        comment: editingComment.comment
      }));
      Utils.dispatchNotification(error.response?.data?.message || 'Failed to edit comment', 'error', dispatch);
    } finally {
      setIsSubmitting(false);
      window.setTimeout(() => commentInputRef.current?.focus(), 0);
    }
  };

  const submitEditReply = async () => {
    if (!editingReply || !profile || isSubmitting || !comment.trim()) return;

    const { comment: commentData, reply } = editingReply;
    try {
      setIsSubmitting(true);
      updateCommentInList(commentData._id, (commentItem) => ({
        ...commentItem,
        replies: (commentItem?.replies || []).map((item: any) =>
          String(item?._id) === String(reply?._id) ? { ...item, comment: comment.trim() } : item
        )
      }));

      const response = await postService.editCommentReply(post._id, commentData._id, reply._id, {
        comment: comment.trim()
      });

      if (response?.data?.comment) {
        updateCommentInList(commentData._id, () => response.data.comment);
      }

      setComment('');
      setEditingReply(null);
    } catch (error: any) {
      updateCommentInList(commentData._id, (commentItem) => ({
        ...commentItem,
        replies: (commentItem?.replies || []).map((item: any) =>
          String(item?._id) === String(reply?._id) ? { ...item, comment: reply.comment } : item
        )
      }));
      Utils.dispatchNotification(error.response?.data?.message || 'Failed to edit reply', 'error', dispatch);
    } finally {
      setIsSubmitting(false);
      window.setTimeout(() => commentInputRef.current?.focus(), 0);
    }
  };

  const deleteComment = async (data: any) => {
    if (!canDeleteComment(data)) return;

    const previousComments = postComments;
    const previousCommentsCount = Number(post.commentsCount || 0);
    const deletedCommentsCount = 1 + (data?.replies || []).length;
    try {
      setActiveCommentMenuId(null);
      setPostComments((comments) => comments.filter((item) => String(item?._id) !== String(data?._id)));
      syncPostCommentsCount(Math.max(previousCommentsCount - deletedCommentsCount, 0));
      await postService.deleteComment(post._id, data._id);
      if (editingComment?._id === data._id) {
        setEditingComment(null);
        setComment('');
      }
    } catch (error: any) {
      setPostComments(previousComments);
      syncPostCommentsCount(previousCommentsCount);
      Utils.dispatchNotification(error.response?.data?.message || 'Failed to delete comment', 'error', dispatch);
    }
  };

  const deleteReply = async (commentData: any, reply: any) => {
    if (!canDeleteReply(commentData, reply)) return;

    const previousComments = postComments;
    const previousCommentsCount = Number(post.commentsCount || 0);
    try {
      setActiveReplyMenuId(null);
      updateCommentInList(commentData._id, (commentItem) => ({
        ...commentItem,
        replies: (commentItem?.replies || []).filter((item: any) => String(item?._id) !== String(reply?._id))
      }));
      syncPostCommentsCount(Math.max(previousCommentsCount - 1, 0));
      await postService.deleteCommentReply(post._id, commentData._id, reply._id);
      if (editingReply?.reply?._id === reply._id) {
        setEditingReply(null);
        setComment('');
      }
    } catch (error: any) {
      setPostComments(previousComments);
      syncPostCommentsCount(previousCommentsCount);
      Utils.dispatchNotification(error.response?.data?.message || 'Failed to delete reply', 'error', dispatch);
    }
  };

  const submitComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingReply) {
      await submitEditReply();
      return;
    }

    if (editingComment) {
      await submitEditComment();
      return;
    }

    if (replyingTo) {
      await submitReply();
      return;
    }

    const canSubmit = comment.trim() || selectedImage || gifUrl;
    if (!canSubmit || !profile || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const nextCommentsCount = Number(post.commentsCount || 0) + 1;
      const commentBody: CreateCommentPayload = {
        userTo: post.userId,
        postId: post._id,
        comment: comment.trim(),
        image: selectedImage || '',
        gifUrl: gifUrl || '',
        commentsCount: nextCommentsCount,
        profilePicture: profile.profilePicture
      };

      // Automatic moderation check
      if (comment.trim()) {
        try {
          const moderationRes = await aiService.checkContent({ text: comment.trim() });
          if (moderationRes.data.result.is_inappropriate) {
            setModerationResult(moderationRes.data.result);
            setIsModerationOpen(true);
            setAiLoading(true);
            try {
              const adviceRes = await aiService.getModerationAdvice({
                result: moderationRes.data.result,
                text: comment.trim(),
                options: aiOptions
              });
              setModerationAdvice(adviceRes.data.advice);
            } catch (err) {
              setModerationAdvice('Your content does not comply with community standards. Please revise it.');
            } finally {
              setAiLoading(false);
            }
            return;
          }
        } catch (error) {
          console.error('Moderation check failed, proceeding with caution...');
        }
      }

      const optimisticComment = {
        _id: `local-${Date.now()}`,
        username: profile.username,
        avatarColor: profile.avatarColor,
        profilePicture: profile.profilePicture,
        comment: comment.trim(),
        image: selectedImage,
        gifUrl: gifUrl,
        reactions: emptyReactions(),
        reactionList: [],
        replies: [],
        createdAt: new Date().toISOString()
      };

      try {
        socketService?.socket?.emit('comment', commentBody);
        const response = await postService.addComment(commentBody);

        // Update list ONLY after successful API response with real ID
        const realComment = response.data.comment || optimisticComment;
        setPostComments((comments) => [realComment, ...comments]);
        syncPostCommentsCount(nextCommentsCount);

        // Clear input after success
        setComment('');
        setSelectedImage(null);
        dispatch(updatePostItem({ gifUrl: '' }));
        if (commentInputRef.current) {
          commentInputRef.current.style.height = '48px';
        }
      } catch (error: any) {
        Utils.dispatchNotification(error.response?.data?.message || 'Failed to post comment', 'error', dispatch);
      }
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message || 'An error occurred', 'error', dispatch);
    } finally {
      setIsSubmitting(false);
      window.setTimeout(() => {
        if (commentInputRef.current) {
          commentInputRef.current.focus();
          commentInputRef.current.style.height = '44px';
        }
      }, 0);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 10MB limit check
      if (file.size > 10 * 1024 * 1024) {
        Utils.dispatchNotification('File size is too large. Maximum is 10MB.', 'error', dispatch);
        event.target.value = '';
        return;
      }
      console.log('Image selected:', file);
      ImageUtils.readAsBase64(file).then((result) => {
        setSelectedImage(result as string);
        dispatch(updatePostItem({ gifUrl: '' }));
        // Reset the value so the same file can be selected again
        event.target.value = '';
      });
    }
  };

  const removeSelectedMedia = () => {
    setSelectedImage(null);
    dispatch(updatePostItem({ gifUrl: '' }));
  };

  const startEditComment = (data: any) => {
    setActiveCommentMenuId(null);
    setReplyingTo(null);
    setSelectedImage(null);
    dispatch(updatePostItem({ gifUrl: '' }));
    setEditingComment(data);
    setEditingReply(null);
    setComment(data?.comment || '');
    window.setTimeout(() => {
      commentInputRef.current?.focus();
      if (commentInputRef.current) {
        commentInputRef.current.style.height = 'auto';
        commentInputRef.current.style.height = `${Math.min(commentInputRef.current.scrollHeight, 160)}px`;
      }
    }, 0);
  };

  const startEditReply = (commentData: any, reply: any) => {
    setActiveReplyMenuId(null);
    setReplyingTo(null);
    setEditingComment(null);
    setSelectedImage(null);
    dispatch(updatePostItem({ gifUrl: '' }));
    setEditingReply({ comment: commentData, reply });
    setComment(reply?.comment || '');
    window.setTimeout(() => {
      commentInputRef.current?.focus();
      if (commentInputRef.current) {
        commentInputRef.current.style.height = 'auto';
        commentInputRef.current.style.height = `${Math.min(commentInputRef.current.scrollHeight, 160)}px`;
      }
    }, 0);
  };

  const cancelComposerMode = () => {
    setReplyingTo(null);
    setEditingComment(null);
    setEditingReply(null);
    setComment('');
  };

  const handleAiAction = async (type: 'generate' | 'improve' | 'check') => {
    setIsAiOpen(false);
    setAiLoading(true);
    try {
      const currentComment = comment.trim();

      if (type === 'check') {
        if (!currentComment) {
          Utils.dispatchNotification('Please enter some text to check.', 'error', dispatch);
          setAiLoading(false);
          return;
        }
        const response = await aiService.checkContent({ text: currentComment });
        setModerationResult(response.data.result);
        setIsModerationOpen(true);

        setLoadingAdvice(true);
        try {
          const adviceRes = await aiService.getModerationAdvice({
            result: response.data.result,
            text: currentComment,
            options: aiOptions
          });
          setModerationAdvice(adviceRes.data.advice);
        } catch (err) {
          setModerationAdvice("Couldn't get advice right now, but please be careful with your content!");
        } finally {
          setLoadingAdvice(false);
        }
        return;
      }

      let body: any = { type, options: aiOptions };

      if (type === 'generate') {
        body.context = `Post content: "${post?.post || ''}". User profile: "${profile?.username}". Write a relevant and engaging comment.`;
      } else {
        body.context = currentComment;
      }

      const response = await aiService.generateCaption(body);
      const result = response.data.result;
      setComment(result.replace(/^[•*-]\s*/, '').trim());
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message || 'Failed to get AI assistance', 'error', dispatch);
    } finally {
      setAiLoading(false);
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
      if (aiRef.current && !aiRef.current.contains(event.target as Node)) {
        if (!aiLoading) {
          setIsAiOpen(false);
          setIsSettingsOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [aiLoading]);

  useEffectOnce(() => {
    getPostComments();
    window.setTimeout(() => commentInputRef.current?.focus(), 100);
  });

  const postImageUrl = post?.imgId && !post?.gifUrl ? Utils.getImage(post.imgId, post.imgVersion) : '';
  const postVideoUrl = post?.videoId ? Utils.getVideo(post.videoId, post.videoVersion) : '';
  const totalCommentsCount = postComments.reduce((total, item) => total + 1 + (item?.replies || []).length, 0);

  useEffect(() => {
    if (!commentsLoaded || !post?._id || Number(post.commentsCount || 0) === totalCommentsCount) {
      return;
    }

    syncPostCommentsCount(totalCommentsCount);
  }, [commentsLoaded, post?._id, post.commentsCount, totalCommentsCount]);

  return (
    <ReactionWrapper closeModal={closeCommentsModal}>
      <div className="flex h-10 items-center justify-center font-bold">Post Interactions</div>
      <div className="relative flex h-[78vh] max-h-[760px] w-full flex-col bg-white overflow-visible">
        <div className="flex-1 overflow-y-auto px-4 pb-4 [scrollbar-width:thin] custom-scrollbar">
          <div className="border-b border-slate-100 py-4">
            <div className="mb-4 flex items-start gap-3">
              <Avatar
                name={post?.username}
                bgColor={post?.avatarColor}
                textColor="#ffffff"
                size={44}
                avatarSrc={post?.profilePicture}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1">
                  <h3 className="text-[15px] font-black text-slate-900">{post?.username}</h3>
                  {post?.feelings && (
                    <span className="text-[14px] font-medium text-slate-500">is feeling {post.feelings}</span>
                  )}
                </div>
                {post?.createdAt && (
                  <p className="mt-0.5 text-[12px] font-semibold text-slate-400">{timeAgo.transform(post.createdAt)}</p>
                )}
              </div>
            </div>

            {post?.post && post?.bgColor === '#ffffff' && (
              <p className="mb-4 whitespace-pre-wrap text-[16px] font-medium leading-relaxed text-slate-900">
                {post.post}
              </p>
            )}

            {post?.post && post?.bgColor !== '#ffffff' && (
              <div
                className="mb-4 flex min-h-[200px] items-center justify-center rounded-2xl p-8 text-center text-[22px] font-black text-white shadow-inner"
                style={{ backgroundColor: post.bgColor }}
              >
                {post.post}
              </div>
            )}

            {postImageUrl && (
              <div className="mb-4 overflow-hidden rounded-2xl bg-slate-50 shadow-sm">
                <img src={postImageUrl} alt="Post" className="max-h-[400px] w-full object-contain" />
              </div>
            )}

            {post?.gifUrl && (
              <div className="mb-4 overflow-hidden rounded-2xl bg-slate-50 shadow-sm">
                <img src={post.gifUrl} alt="Post GIF" className="max-h-[400px] w-full object-contain" />
              </div>
            )}

            {postVideoUrl && (
              <div className="mb-4 overflow-hidden rounded-2xl bg-black shadow-sm">
                <video src={postVideoUrl} className="max-h-[400px] w-full" controls />
              </div>
            )}
          </div>

          <div className="py-6">
            <div className="mb-5 flex items-center justify-between px-1">
              <h3 className="text-[18px] font-black text-slate-900">Comments</h3>
              <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[12px] font-bold text-slate-500">
                {totalCommentsCount} total
              </div>
            </div>

            {postComments.length > 0 ? (
              <ul className="space-y-5">
                {postComments.map((data) => {
                  const selectedReaction = getUserCommentReaction(data)?.type || '';
                  const reactionCount = getCommentReactionCount(data);
                  const formattedReactions = Utils.formattedReactions(data?.reactions || emptyReactions()).slice(0, 3);
                  const primaryReaction = formattedReactions[0]?.type;

                  return (
                    <li
                      className="relative flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
                      key={data?._id}
                      data-testid="modal-list-item"
                    >
                      <Avatar
                        name={data?.username}
                        bgColor={data?.avatarColor}
                        textColor="#ffffff"
                        size={32}
                        avatarSrc={data?.profilePicture}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex max-w-full items-start gap-1">
                          <div className="inline-block max-w-full rounded-2xl bg-slate-100 px-4 py-2.5 shadow-sm">
                            <h4 className="text-[13px] font-black leading-none text-slate-900">{data?.username}</h4>
                            <p className="mt-2 whitespace-pre-wrap wrap-break-word text-[14px] leading-snug text-slate-800">
                              {data?.comment}
                            </p>
                            {data?.image && (
                              <div className="mt-3 overflow-hidden rounded-xl shadow-md border border-white">
                                <img src={data.image} alt="Comment" className="max-h-[300px] w-full object-contain" />
                              </div>
                            )}
                            {data?.gifUrl && (
                              <div className="mt-3 overflow-hidden rounded-xl shadow-md border border-white">
                                <img
                                  src={data.gifUrl}
                                  alt="Comment GIF"
                                  className="max-h-[300px] w-full object-contain"
                                />
                              </div>
                            )}
                          </div>
                          {canDeleteComment(data) && (
                            <div className="relative">
                              <button
                                type="button"
                                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                onClick={() =>
                                  setActiveCommentMenuId(
                                    activeCommentMenuId === String(data?._id) ? null : String(data?._id)
                                  )
                                }
                              >
                                <FaEllipsisH size={14} />
                              </button>
                              {activeCommentMenuId === String(data?._id) && (
                                <>
                                  <div
                                    className="fixed inset-0 z-140"
                                    onClick={() => setActiveCommentMenuId(null)}
                                  ></div>
                                  <div className="absolute right-0 top-8 z-150 w-36 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-xl">
                                    {canEditComment(data) && (
                                      <button
                                        type="button"
                                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] font-bold text-slate-700 transition-colors hover:bg-slate-50"
                                        onClick={() => startEditComment(data)}
                                      >
                                        <FaEdit size={13} />
                                        Edit
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] font-bold text-red-500 transition-colors hover:bg-red-50"
                                      onClick={() => deleteComment(data)}
                                    >
                                      <FaTrashAlt size={13} />
                                      Delete
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="mt-1.5 flex h-5 items-center gap-3 px-2">
                          {data?.createdAt && (
                            <p className="text-[11px] font-bold leading-none text-slate-400">
                              {timeAgo.transform(data.createdAt)}
                            </p>
                          )}
                          <div
                            className="relative flex h-5 items-center"
                            onMouseEnter={() => setActiveReactionCommentId(String(data?._id))}
                            onMouseLeave={() => setActiveReactionCommentId(null)}
                          >
                            <button
                              className="text-[11px] font-bold leading-none text-slate-500 transition-colors hover:text-blue-600"
                              style={{ color: selectedReaction ? getReactionTextColor(selectedReaction) : undefined }}
                              onClick={() => addCommentReaction(data, 'like')}
                            >
                              {selectedReaction ? Utils.firstLetterUpperCase(selectedReaction) : 'Like'}
                            </button>
                            {activeReactionCommentId === String(data?._id) && (
                              <div
                                className="absolute bottom-full left-0 z-160 pb-2"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <Reactions handleClick={(reaction) => addCommentReaction(data, reaction)} />
                              </div>
                            )}
                          </div>
                          <button
                            className="text-[11px] font-bold leading-none text-slate-500 transition-colors hover:text-blue-600"
                            onClick={() => {
                              setReplyingTo(data);
                              window.setTimeout(() => commentInputRef.current?.focus(), 0);
                            }}
                          >
                            Reply
                          </button>
                          {reactionCount > 0 && primaryReaction && (
                            <div className="flex h-5 items-center gap-1">
                              <span className="text-[11px] font-bold leading-none text-slate-500">{reactionCount}</span>
                              <div className="flex h-5 items-center -space-x-1">
                                {formattedReactions.map((reaction) => (
                                  <img
                                    key={reaction.type}
                                    src={reactionsMap[reaction.type]}
                                    alt={reaction.type}
                                    className="block h-4 w-4 rounded-full ring-1 ring-white"
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {data?.replies?.length > 0 && (
                          <div className="relative mt-3 ml-1 pl-8">
                            <div className="absolute left-0 top-0 bottom-3 w-px bg-slate-300" aria-hidden="true"></div>
                            <ul className="space-y-3">
                              {data.replies.map((reply: any) => {
                                const selectedReplyReaction = getUserReplyReaction(reply)?.type || '';
                                const replyReactionCount = getReplyReactionCount(reply);
                                const formattedReplyReactions = Utils.formattedReactions(
                                  reply?.reactions || emptyReactions()
                                ).slice(0, 3);
                                const primaryReplyReaction = formattedReplyReactions[0]?.type;

                                return (
                                  <li className="relative flex items-start gap-2" key={reply?._id || reply?.createdAt}>
                                    <div
                                      className="absolute -left-8 top-3 h-4 w-6 rounded-bl-xl border-b-2 border-l-2 border-slate-300"
                                      aria-hidden="true"
                                    ></div>
                                    <Avatar
                                      name={reply?.username}
                                      bgColor={reply?.avatarColor}
                                      textColor="#ffffff"
                                      size={26}
                                      avatarSrc={reply?.profilePicture}
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className="flex max-w-full items-start gap-1">
                                        <div className="inline-block max-w-full rounded-2xl bg-slate-100 px-3 py-2 shadow-sm">
                                          <h5 className="text-[12px] font-black leading-none text-slate-900">
                                            {reply?.username}
                                          </h5>
                                          <p className="mt-1.5 whitespace-pre-wrap wrap-break-word text-[13px] leading-snug text-slate-800">
                                            {reply?.comment}
                                          </p>
                                          {reply?.image && (
                                            <div className="mt-2 overflow-hidden rounded-xl border border-white shadow-sm">
                                              <img
                                                src={reply.image}
                                                alt="Reply"
                                                className="max-h-[220px] w-full object-contain"
                                              />
                                            </div>
                                          )}
                                          {reply?.gifUrl && (
                                            <div className="mt-2 overflow-hidden rounded-xl border border-white shadow-sm">
                                              <img
                                                src={reply.gifUrl}
                                                alt="Reply GIF"
                                                className="max-h-[220px] w-full object-contain"
                                              />
                                            </div>
                                          )}
                                        </div>
                                        {canDeleteReply(data, reply) && (
                                          <div className="relative">
                                            <button
                                              type="button"
                                              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                              onClick={() =>
                                                setActiveReplyMenuId(
                                                  activeReplyMenuId === String(reply?._id) ? null : String(reply?._id)
                                                )
                                              }
                                            >
                                              <FaEllipsisH size={12} />
                                            </button>
                                            {activeReplyMenuId === String(reply?._id) && (
                                              <>
                                                <div
                                                  className="fixed inset-0 z-140"
                                                  onClick={() => setActiveReplyMenuId(null)}
                                                ></div>
                                                <div className="absolute right-0 top-7 z-150 w-36 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-xl">
                                                  {canEditReply(reply) && (
                                                    <button
                                                      type="button"
                                                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] font-bold text-slate-700 transition-colors hover:bg-slate-50"
                                                      onClick={() => startEditReply(data, reply)}
                                                    >
                                                      <FaEdit size={13} />
                                                      Edit
                                                    </button>
                                                  )}
                                                  <button
                                                    type="button"
                                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] font-bold text-red-500 transition-colors hover:bg-red-50"
                                                    onClick={() => deleteReply(data, reply)}
                                                  >
                                                    <FaTrashAlt size={13} />
                                                    Delete
                                                  </button>
                                                </div>
                                              </>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      <div className="mt-1 flex h-5 items-center gap-3 px-2">
                                        {reply?.createdAt && (
                                          <p className="text-[11px] font-bold leading-none text-slate-400">
                                            {timeAgo.transform(reply.createdAt)}
                                          </p>
                                        )}
                                        <div
                                          className="relative flex h-5 items-center"
                                          onMouseEnter={() => setActiveReactionReplyId(String(reply?._id))}
                                          onMouseLeave={() => setActiveReactionReplyId(null)}
                                        >
                                          <button
                                            className="text-[11px] font-bold leading-none text-slate-500 transition-colors hover:text-blue-600"
                                            style={{
                                              color: selectedReplyReaction
                                                ? getReactionTextColor(selectedReplyReaction)
                                                : undefined
                                            }}
                                            onClick={() => addReplyReaction(data, reply, 'like')}
                                          >
                                            {selectedReplyReaction
                                              ? Utils.firstLetterUpperCase(selectedReplyReaction)
                                              : 'Like'}
                                          </button>
                                          {activeReactionReplyId === String(reply?._id) && (
                                            <div
                                              className="absolute bottom-full left-0 z-160 pb-2"
                                              onClick={(event) => event.stopPropagation()}
                                            >
                                              <Reactions
                                                handleClick={(reaction) => addReplyReaction(data, reply, reaction)}
                                              />
                                            </div>
                                          )}
                                        </div>
                                        <button
                                          className="text-[11px] font-bold leading-none text-slate-500 transition-colors hover:text-blue-600"
                                          onClick={() => {
                                            setReplyingTo(data);
                                            window.setTimeout(() => commentInputRef.current?.focus(), 0);
                                          }}
                                        >
                                          Reply
                                        </button>
                                        {replyReactionCount > 0 && primaryReplyReaction && (
                                          <div className="flex h-5 items-center gap-1">
                                            <span className="text-[11px] font-bold leading-none text-slate-500">
                                              {replyReactionCount}
                                            </span>
                                            <div className="flex h-5 items-center -space-x-1">
                                              {formattedReplyReactions.map((reaction) => (
                                                <img
                                                  key={reaction.type}
                                                  src={reactionsMap[reaction.type]}
                                                  alt={reaction.type}
                                                  className="block h-4 w-4 rounded-full ring-1 ring-white"
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl bg-slate-50 px-8 py-16 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                  <FaSmile size={32} />
                </div>
                <p className="text-[16px] font-black text-slate-700">No comments yet</p>
                <p className="mt-2 text-[14px] font-medium text-slate-400">Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>

        <form
          onSubmit={submitComment}
          className="border-t border-slate-100 bg-white p-4 shadow-[0_-8px_16px_rgba(0,0,0,0.03)]"
        >
          {editingComment && (
            <div className="mb-3 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-2">
              <span className="text-[13px] font-semibold text-blue-700">Editing your comment</span>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-full text-blue-500 transition-colors hover:bg-blue-100 hover:text-blue-800"
                onClick={cancelComposerMode}
              >
                <FaTimes size={12} />
              </button>
            </div>
          )}
          {editingReply && (
            <div className="mb-3 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-2">
              <span className="text-[13px] font-semibold text-blue-700">Editing your reply</span>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-full text-blue-500 transition-colors hover:bg-blue-100 hover:text-blue-800"
                onClick={cancelComposerMode}
              >
                <FaTimes size={12} />
              </button>
            </div>
          )}
          {replyingTo && (
            <div className="mb-3 flex items-center justify-between rounded-xl bg-slate-100 px-4 py-2">
              <span className="text-[13px] font-semibold text-slate-500">
                Replying to <strong className="text-slate-800">{replyingTo.username}</strong>
              </span>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
                onClick={cancelComposerMode}
              >
                <FaTimes size={12} />
              </button>
            </div>
          )}
          {(selectedImage || gifUrl) && (
            <div className="mb-4 animate-in slide-in-from-bottom-4 duration-200">
              <div className="relative inline-block overflow-hidden rounded-2xl border-2 border-white bg-slate-50 shadow-xl ring-1 ring-slate-200">
                <img src={selectedImage || gifUrl} alt="Preview" className="max-h-48 w-auto object-contain" />
                <button
                  type="button"
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-all hover:bg-black/80 hover:scale-110 active:scale-95 shadow-lg"
                  onClick={removeSelectedMedia}
                >
                  <FaTimes size={14} />
                </button>
              </div>
            </div>
          )}
          <div className="relative flex flex-col overflow-visible rounded-2xl border border-slate-100 bg-slate-100 focus-within:border-slate-200 focus-within:bg-slate-100 focus-within:shadow-lg transition-all duration-300">
            <textarea
              ref={commentInputRef}
              value={comment}
              rows={1}
              className="w-full min-h-[48px] max-h-[160px] bg-transparent px-5 py-3.5 text-[15px] font-medium text-slate-900 outline-none placeholder:text-slate-400 resize-none custom-scrollbar"
              placeholder={
                editingComment
                  ? 'Edit your comment...'
                  : editingReply
                    ? 'Edit your reply...'
                    : replyingTo
                      ? `Reply to ${replyingTo.username}...`
                      : 'Write a comment...'
              }
              onInput={(e) => {
                e.currentTarget.style.height = 'auto';
                e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 160)}px`;
              }}
              onChange={(event) => setComment(event.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submitComment(e as any);
                }
              }}
            />
            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-1">
                <div className="relative flex items-center" ref={emojiRef}>
                  <button
                    type="button"
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 ${isEmojiPickerOpen ? 'bg-orange-50 text-orange-500' : 'text-slate-500 hover:bg-slate-200'}`}
                    onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                  >
                    <FaSmile size={22} />
                  </button>
                  {isEmojiPickerOpen && (
                    <div className="absolute bottom-full left-0 mb-4 z-10000 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                      <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        autoFocusSearch={false}
                        theme={Theme.LIGHT}
                        width={300}
                        height={380}
                        previewConfig={{ showPreview: false }}
                        skinTonesDisabled
                      />
                    </div>
                  )}
                </div>
                <div className="relative flex items-center" ref={aiRef}>
                  <button
                    type="button"
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 ${isAiOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-200'}`}
                    disabled={!!editingComment || !!editingReply || aiLoading}
                    onClick={() => setIsAiOpen(!isAiOpen)}
                  >
                    {aiLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                    ) : (
                      <FaRobot size={22} className={isAiOpen ? 'animate-pulse' : ''} />
                    )}
                  </button>

                  {isAiOpen && (
                    <div className="absolute bottom-full left-0 mb-4 z-200 w-[280px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="px-4 py-3 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-slate-100 flex items-center justify-between">
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
                              type: 'generate',
                              label: 'Generate Comment',
                              icon: <FaPencilAlt />,
                              color: 'text-blue-500',
                              visible: true
                            },
                            {
                              type: 'improve',
                              label: 'Improve Comment',
                              icon: <FaMagic />,
                              color: 'text-purple-500',
                              visible: comment.trim().length > 0
                            },
                            {
                              type: 'check',
                              label: 'Content Check',
                              icon: <FaShieldAlt />,
                              color: 'text-green-500',
                              visible: comment.trim().length > 0
                            }
                          ]
                            .filter((item) => item.visible)
                            .map((item) => (
                              <div
                                key={item.label}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-all group"
                                onClick={() => handleAiAction(item.type as any)}
                              >
                                <div
                                  className={`w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}
                                >
                                  {item.icon}
                                </div>
                                <span className="text-[14px] font-bold text-gray-800">{item.label}</span>
                              </div>
                            ))}
                        </div>
                      )}
                      <div className="px-4 py-2 bg-gray-50 border-t border-slate-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
                          Powered by ChattyAI
                        </p>
                      </div>
                    </div>
                  )}
                </div>

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
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-all duration-200 hover:bg-slate-200 hover:scale-110"
                  disabled={!!editingComment || !!editingReply}
                  onClick={() => imageInputRef.current?.click()}
                >
                  <FaImage size={22} />
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-all duration-200 hover:bg-slate-200 hover:scale-110"
                  disabled={!!editingComment || !!editingReply}
                  onClick={() => dispatch(toggleGifModal(!gifModalIsOpen))}
                >
                  <MdGif size={30} />
                </button>
              </div>
              <button
                type="submit"
                disabled={(!comment.trim() && !selectedImage && !gifUrl) || isSubmitting}
                className="group flex h-10 w-10 items-center justify-center rounded-full text-blue-600 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-110 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-slate-300 disabled:hover:scale-100 shadow-sm"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent group-hover:border-white"></div>
                ) : (
                  <FaPaperPlane
                    size={20}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                )}
              </button>
            </div>
          </div>
          {gifModalIsOpen && (
            <div className="fixed inset-0 z-150 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
              <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
                  <h3 className="text-[18px] font-black text-slate-800">Select a GIF</h3>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:scale-110 active:scale-95"
                    onClick={() => dispatch(toggleGifModal(false))}
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
                <div className="max-h-[65vh] overflow-y-auto p-4 custom-scrollbar">
                  <Giphy />
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </ReactionWrapper>
  );
};

export default CommentsModal;
