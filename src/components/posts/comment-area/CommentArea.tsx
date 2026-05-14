import { FaRegCommentAlt, FaRegBookmark, FaShareSquare } from 'react-icons/fa';
import './CommentArea.scss';
import SaveToModal from '../post-modal/save-to-modal/SaveToModal';
import type { PostItem } from '@app-types/post';
import Reactions from '../reactions/Reaction';
import { useCallback, useEffect, useState } from 'react';
import { cloneDeep, filter, find, findIndex } from 'lodash';
import { Utils } from '@services/utils/utils.service';
import { reactionsMap } from '@services/utils/static.data';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@redux/store';
import { postService } from '@services/api/post/post.service';
import type { ReactionType } from '@app-types/reaction';
import type { CreateReactionPayload, IReaction } from '@app-types/reactions';
import { addReactions } from '@redux/reducers/post/user-post-reaction.reducer';
import { socketService } from '@services/socket/socket.service';
import { updatePostItem } from '@redux/reducers/post/post.reducer';
import { toggleCommentsModal, openModal } from '@redux/reducers/modal/modal.reducer';

interface ICommentAreaProps {
  post: PostItem;
  setPosts?: React.Dispatch<React.SetStateAction<any[]>>;
}

const CommentArea = ({ post, setPosts }: ICommentAreaProps) => {
  const { profile } = useSelector((state: RootState) => state.user);
  let { reactions } = useSelector((state: RootState) => state.userPostReaction);
  const [selectedReaction, setSelectedReaction] = useState<string>('like');
  const dispatch = useDispatch<AppDispatch>();

  const [showReactions, setShowReactions] = useState<boolean>(false);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);

  const handleShareClick = () => {
    dispatch(openModal({ type: 'share', data: post }));
  };

  const selectedUserReaction = useCallback(
    (postReactions: any[]) => {
      const userReaction = find(postReactions, (reaction) => reaction.postId === post._id);
      if (userReaction) {
        setSelectedReaction(userReaction.type);
      } else {
        setSelectedReaction('');
      }
    },
    [post]
  );

  const toggleCommentInput = () => {
    dispatch(updatePostItem(post));
    dispatch(toggleCommentsModal(true));
  };

  const addReactionPost = async (reaction: ReactionType) => {
    try {
      setShowReactions(false);
      const reactionResponse = await postService.getSinglePostReactionByUsername(post._id!, profile!.username);
      post = await updatePostReaction(
        reaction,
        Object.keys(reactionResponse.data.reaction).length > 0,
        reactionResponse.data.reaction?.type
      );

      const postReactions = addNewReaction(
        reaction,
        Object.keys(reactionResponse.data.reaction).length > 0,
        reactionResponse.data.reaction?.type
      );

      reactions = [...postReactions];
      dispatch(addReactions(reactions));

      sendSocketIOReactions(
        post,
        reaction,
        Object.keys(reactionResponse.data.reaction).length > 0,
        reactionResponse.data.reaction?.type
      );

      const reactionData: CreateReactionPayload = {
        userTo: post.userId,
        postId: post._id,
        type: reaction,
        previousReaction:
          Object.keys(reactionResponse.data.reaction).length > 0 ? reactionResponse.data.reaction?.type : '',
        postReactions: post.reactions,
        profilePicture: profile!.profilePicture
      };

      if (!Object.keys(reactionResponse.data.reaction).length) {
        await postService.addReaction(reactionData);
      } else {
        reactionData.previousReaction = reactionResponse.data.reaction?.type;
        if (reactionData.previousReaction === reaction) {
          await postService.removeReaction(post._id!, reactionData.previousReaction, post.reactions);
        } else {
          await postService.addReaction(reactionData);
        }
      }

      if (setPosts) {
        setPosts((prevPosts) => {
          const posts = cloneDeep(prevPosts);
          const index = findIndex(posts, (p) => String(p._id) === String(post._id));
          if (index > -1) {
            posts.splice(index, 1, post);
          }
          return posts;
        });
      }
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const updatePostReaction = async (
    newReaction: ReactionType,
    hasResponse: boolean,
    previousReaction: ReactionType
  ) => {
    post = cloneDeep(post);
    if (!hasResponse) {
      post.reactions[newReaction] = (post.reactions[newReaction] || 0) + 1;
    } else {
      if (post.reactions[previousReaction] > 0) {
        post.reactions[previousReaction] -= 1;
      }
      if (previousReaction !== newReaction) {
        post.reactions[newReaction] = (post.reactions[newReaction] || 0) + 1;
      }
    }
    return post;
  };

  const addNewReaction = (newReaction: ReactionType, hasResponse: boolean, previousReaction: ReactionType) => {
    const postReactions = filter(reactions, (reaction) => reaction.postId !== post._id);
    const newPostReaction: IReaction = {
      avatarColor: profile!.avatarColor,
      createdAt: `${new Date()}`,
      postId: post._id,
      profilePicture: profile!.profilePicture,
      username: profile!.username,
      type: newReaction
    };
    if (hasResponse && previousReaction !== newReaction) {
      postReactions.push(newPostReaction);
    } else if (!hasResponse) {
      postReactions.push(newPostReaction);
    }
    return postReactions;
  };

  const sendSocketIOReactions = (
    post: PostItem,
    reaction: ReactionType,
    hasResponse: boolean,
    previousReaction: ReactionType
  ) => {
    const socketReactionData = {
      userTo: post.userId,
      postId: post._id,
      username: profile?.username,
      avatarColor: profile?.avatarColor,
      type: reaction,
      postReactions: post.reactions,
      profilePicture: profile?.profilePicture,
      previousReaction: hasResponse ? previousReaction : ''
    };

    socketService?.socket?.emit('reaction', socketReactionData);
  };

  useEffect(() => {
    selectedUserReaction(reactions);
  }, [selectedUserReaction, reactions]);

  return (
    <div
      className="flex items-center justify-between border-t border-[#f0f2f5] w-full px-2 py-1 box-border min-h-[44px]"
      data-testid="comment-area"
    >
      <div
        className="flex-1 flex items-center justify-center py-[10px] rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#f2f3f5] relative group"
        onMouseEnter={() => setShowReactions(true)}
      >
        <div
          className="flex items-center justify-center gap-[10px] w-full h-full"
          onClick={() => addReactionPost('like')}
        >
          <div className="flex items-center gap-[6px]">
            <img
              className="w-[18px] h-[18px] object-contain mt-[2px]"
              src={reactionsMap[(selectedReaction || 'like') as keyof typeof reactionsMap]}
              alt=""
            />
            <span
              className={`text-[15px] font-semibold`}
              style={{
                color:
                  selectedReaction === 'love'
                    ? 'var(--red-1)'
                    : selectedReaction !== '' && selectedReaction !== 'like'
                      ? 'var(--yellow-1)'
                      : selectedReaction === 'like'
                        ? 'var(--primary-1)'
                        : '#65676b'
              }}
            >
              {Utils.firstLetterUpperCase(selectedReaction || 'like')}
            </span>
          </div>
        </div>

        {/* Reactions Popup */}
        <div
          className="absolute bottom-full left-0 pb-[15px] z-100 hidden group-hover:block"
          onClick={(e) => e.stopPropagation()}
        >
          {showReactions && <Reactions handleClick={addReactionPost} />}
        </div>
      </div>

      <div
        className="flex-1 flex items-center justify-center py-[10px] rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#f2f3f5] text-[#65676b] font-semibold gap-[10px]"
        onClick={toggleCommentInput}
      >
        <FaRegCommentAlt className="text-[16px]" />
        <span className="text-[15px]">Comments</span>
      </div>

      <div
        className="flex-1 flex items-center justify-center py-[10px] rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#f2f3f5] text-[#65676b] font-semibold gap-[10px]"
        onClick={() => setShowSaveModal(true)}
      >
        <FaRegBookmark className="text-[16px]" />
        <span className="text-[15px]">Save</span>
      </div>

      {showSaveModal && <SaveToModal postId={post._id!} onClose={() => setShowSaveModal(false)} />}

      {post.userId !== profile?._id && (
        <div
          className="flex-1 flex items-center justify-center py-[10px] rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#f2f3f5] text-[#65676b] font-semibold gap-[10px]"
          onClick={handleShareClick}
        >
          <FaShareSquare className="text-[16px]" />
          <span className="text-[15px]">Share</span>
        </div>
      )}
    </div>
  );
};

export default CommentArea;
