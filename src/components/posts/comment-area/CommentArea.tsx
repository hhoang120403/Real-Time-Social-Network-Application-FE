import { FaRegCommentAlt } from 'react-icons/fa';
import './CommentArea.scss';
import type { PostItem } from '@app-types/post';
import Reactions from '../reactions/Reaction';
import { useCallback, useEffect, useState } from 'react';
import { cloneDeep, filter, find } from 'lodash';
import { Utils } from '@services/utils/utils.service';
import { reactionsMap } from '@services/utils/static.data';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@redux/store';
import { postService } from '@services/api/post/post.service';
import type { ReactionType } from '@app-types/reaction';
import type { CreateReactionPayload, IReaction } from '@app-types/reactions';
import { addReactions } from '@redux/reducers/post/user-post-reaction.reducer';
import { socketService } from '@services/socket/socket.service';
import useLocalStorage from '@hooks/useLocalStorage';
import { clearPost, updatePostItem } from '@redux/reducers/post/post.reducer';

interface ICommentAreaProps {
  post: PostItem;
}

const CommentArea = ({ post }: ICommentAreaProps) => {
  const { profile } = useSelector((state: RootState) => state.user);
  let { reactions } = useSelector((state: RootState) => state.userPostReaction);
  const [selectedReaction, setSelectedReaction] = useState<string>('like');
  const selectedPostId = useLocalStorage('selectedPostId', 'get');
  const [setSelectedPostId] = useLocalStorage('selectedPostId', 'set');
  const dispatch = useDispatch<AppDispatch>();

  const [showReactions, setShowReactions] = useState<boolean>(true);

  const selectedUserReaction = useCallback(
    (postReactions: any[]) => {
      const userReaction = find(postReactions, (reaction) => reaction.postId === post._id);
      const result = userReaction ? Utils.firstLetterUpperCase(userReaction.type) : 'Like';
      setSelectedReaction(result);
    },
    [post]
  );

  const toggleCommentInput = () => {
    if (!selectedPostId) {
      setSelectedPostId(post._id!);
      dispatch(updatePostItem(post));
    } else {
      removeSelectedPostId();
    }
  };

  const removeSelectedPostId = () => {
    if (selectedPostId === post._id) {
      setSelectedPostId('');
      dispatch(clearPost());
    } else {
      setSelectedPostId(post._id!);
      dispatch(updatePostItem(post));
    }
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
      post.reactions[newReaction] += 1;
    } else {
      if (post.reactions[previousReaction] > 0) {
        post.reactions[previousReaction] -= 1;
      }
      if (previousReaction !== newReaction) {
        post.reactions[newReaction] += 1;
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
    <div className="comment-area" data-testid="comment-area">
      <div className="like-icon reactions" onMouseEnter={() => setShowReactions(true)}>
        <div className="likes-block" onClick={() => addReactionPost('like')}>
          <div className={`likes-block-icons reaction-icon ${selectedReaction.toLowerCase()}`}>
            <div className={`reaction-display ${selectedReaction.toLowerCase()}`} data-testid="selected-reaction">
              <img
                className="reaction-img"
                src={reactionsMap[selectedReaction.toLowerCase() as keyof typeof reactionsMap]}
                alt=""
              />
              <span>{selectedReaction}</span>
            </div>
          </div>
        </div>
        <div className="reactions-container app-reactions">
          {showReactions && <Reactions handleClick={addReactionPost} />}
        </div>
      </div>
      <div className="comment-block" onClick={toggleCommentInput}>
        <span className="comments-text">
          <FaRegCommentAlt className="comment-alt" /> <span>Comments</span>
        </span>
      </div>
    </div>
  );
};

export default CommentArea;
