import Avatar from '@components/avatar/Avatar';
import ReactionWrapper from '@components/posts/modal-wrappers/reaction-wrapper/ReactionWrapper';
import { Utils } from '@services/utils/utils.service';
import { timeAgo } from '@services/utils/timeago.utils';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@redux/store';
import { useRef, useState } from 'react';
import { postService } from '@services/api/post/post.service';
import useEffectOnce from '@hooks/useEffectOnce';
import { closeModal } from '@redux/reducers/modal/modal.reducer';
import { clearPost, updatePostItem } from '@redux/reducers/post/post.reducer';
import type { CreateCommentPayload } from '@app-types/comments';
import { socketService } from '@services/socket/socket.service';
import { FaPaperPlane } from 'react-icons/fa';

const CommentsModal = () => {
  const { post, user } = useSelector((state: RootState) => state);
  const profile = user.profile;
  const [postComments, setPostComments] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<AppDispatch>();

  const getPostComments = async () => {
    try {
      const response = await postService.getPostComments(post?._id);
      const comments = response?.data?.comments || [];
      setPostComments(
        [...comments].sort((a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime())
      );
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const closeCommentsModal = () => {
    dispatch(closeModal());
    dispatch(clearPost());
  };

  const submitComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!comment.trim() || !profile || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const nextCommentsCount = Number(post.commentsCount || 0) + 1;
      const commentBody: CreateCommentPayload = {
        userTo: post.userId,
        postId: post._id,
        comment: comment.trim(),
        commentsCount: nextCommentsCount,
        profilePicture: profile.profilePicture
      };
      const optimisticComment = {
        _id: `local-${Date.now()}`,
        username: profile.username,
        avatarColor: profile.avatarColor,
        profilePicture: profile.profilePicture,
        comment: comment.trim(),
        createdAt: new Date().toISOString()
      };

      setPostComments((comments) => [optimisticComment, ...comments]);
      dispatch(updatePostItem({ commentsCount: nextCommentsCount }));
      socketService?.socket?.emit('comment', commentBody);
      await postService.addComment(commentBody);
      setComment('');
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    } finally {
      setIsSubmitting(false);
      window.setTimeout(() => commentInputRef.current?.focus(), 0);
    }
  };

  useEffectOnce(() => {
    getPostComments();
    window.setTimeout(() => commentInputRef.current?.focus(), 100);
  });

  const postImageUrl = post?.imgId && !post?.gifUrl ? Utils.getImage(post.imgId, post.imgVersion) : '';
  const postVideoUrl = post?.videoId ? Utils.getVideo(post.videoId, post.videoVersion) : '';

  return (
    <ReactionWrapper closeModal={closeCommentsModal}>
      <h2 className="w-full text-center text-[20px] font-black text-slate-900">{post?.username}'s Post</h2>

      <div className="flex h-[78vh] max-h-[760px] w-full flex-col overflow-hidden bg-white">
        <div className="flex-1 overflow-y-auto px-4 pb-4 [scrollbar-width:thin]">
          <div className="border-b border-slate-100 py-4">
            <div className="mb-3 flex items-start gap-3">
              <Avatar
                name={post?.username}
                bgColor={post?.avatarColor}
                textColor="#ffffff"
                size={44}
                avatarSrc={post?.profilePicture}
              />
              <div className="min-w-0">
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
              <p className="mb-3 whitespace-pre-wrap text-[15px] font-medium leading-6 text-slate-900">{post.post}</p>
            )}

            {post?.post && post?.bgColor !== '#ffffff' && (
              <div
                className="mb-3 flex min-h-[220px] items-center justify-center rounded-xl p-6 text-center text-[24px] font-black text-white"
                style={{ backgroundColor: post.bgColor }}
              >
                {post.post}
              </div>
            )}

            {postImageUrl && (
              <div className="mb-3 overflow-hidden rounded-xl bg-slate-100">
                <img src={postImageUrl} alt="Post" className="max-h-[440px] w-full object-contain" />
              </div>
            )}

            {post?.gifUrl && (
              <div className="mb-3 overflow-hidden rounded-xl bg-slate-100">
                <img src={post.gifUrl} alt="Post GIF" className="max-h-[440px] w-full object-contain" />
              </div>
            )}

            {postVideoUrl && (
              <div className="mb-3 overflow-hidden rounded-xl bg-black">
                <video src={postVideoUrl} className="max-h-[440px] w-full" controls />
              </div>
            )}
          </div>

          <div className="py-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[17px] font-black text-slate-900">Comments</h3>
              <span className="text-[13px] font-bold text-slate-400">{postComments.length} total</span>
            </div>

            {postComments.length > 0 ? (
              <ul className="space-y-3">
                {postComments.map((data) => (
                  <li className="flex items-start gap-2.5" key={data?._id} data-testid="modal-list-item">
                    <Avatar
                      name={data?.username}
                      bgColor={data?.avatarColor}
                      textColor="#ffffff"
                      size={36}
                      avatarSrc={data?.profilePicture}
                    />
                    <div className="min-w-0">
                      <div className="rounded-2xl bg-slate-100 px-3 py-2">
                        <h4 className="text-[13px] font-black leading-5 text-slate-900">{data?.username}</h4>
                        <p className="whitespace-pre-wrap break-words text-[14px] leading-5 text-slate-800">
                          {data?.comment}
                        </p>
                      </div>
                      {data?.createdAt && (
                        <p className="mt-1 px-3 text-[11px] font-bold text-slate-400">
                          {timeAgo.transform(data.createdAt)}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 px-6 py-12 text-center">
                <p className="text-[15px] font-black text-slate-700">No comments yet</p>
                <p className="mt-1 text-[13px] font-medium text-slate-400">Start the conversation on this post.</p>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={submitComment} className="border-t border-slate-100 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <Avatar
              name={profile?.username || 'User'}
              bgColor={profile?.avatarColor || '#2563eb'}
              textColor="#ffffff"
              size={36}
              avatarSrc={profile?.profilePicture}
            />
            <div className="flex flex-1 items-center rounded-full bg-slate-100 px-4 py-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
              <input
                ref={commentInputRef}
                value={comment}
                className="min-w-0 flex-1 bg-transparent py-1 text-[14px] font-medium text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Write a comment..."
                onChange={(event) => setComment(event.target.value)}
              />
              <button
                type="submit"
                disabled={!comment.trim() || isSubmitting}
                className="ml-2 flex h-8 w-8 items-center justify-center rounded-full text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-slate-300"
              >
                <FaPaperPlane className="text-[14px]" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </ReactionWrapper>
  );
};

export default CommentsModal;
