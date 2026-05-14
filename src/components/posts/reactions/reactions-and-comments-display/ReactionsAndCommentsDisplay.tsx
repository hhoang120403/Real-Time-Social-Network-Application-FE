import { FaSpinner } from 'react-icons/fa';
// import type { PostItem } from '@app-types/post';
import '@components/posts/reactions/reactions-and-comments-display/ReactionsAndCommentsDisplay.scss';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@redux/store';
import { Utils } from '@services/utils/utils.service';
import { useState } from 'react';
import { postService } from '@services/api/post/post.service';
import { reactionsMap } from '@services/utils/static.data';
import { updatePostItem } from '@redux/reducers/post/post.reducer';
import { toggleCommentsModal, toggleReactionsModal } from '@redux/reducers/modal/modal.reducer';
import UsersModal from '@components/posts/post-modal/users-modal/UsersModal';

interface IReactionsAndCommentsDisplayProps {
  post: any;
}

const ReactionsAndCommentsDisplay = ({ post }: IReactionsAndCommentsDisplayProps) => {
  const { reactionsModalIsOpen, commentsModalIsOpen } = useSelector((state: RootState) => state.modal);
  const selectedPost = useSelector((state: RootState) => state.post);
  const [postReactions, setPostReactions] = useState<any[]>([]);
  const [postCommentsNames, setPostCommentsNames] = useState<any[]>([]);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [usersModalType, setUsersModalType] = useState<'share' | 'save'>('share');
  const dispatch = useDispatch<AppDispatch>();
  const displayPost =
    String(selectedPost?._id || '') === String(post?._id || '')
      ? { ...post, commentsCount: selectedPost.commentsCount }
      : post;

  const getPostReactions = async () => {
    try {
      const response = await postService.getPostReactions(post._id!);
      setPostReactions(response.data.reactions);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const getPostCommentsNames = async () => {
    try {
      const response = await postService.getPostCommentsNames(post._id!);
      setPostCommentsNames([...new Set(response.data.comments.names)]);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const sumAllReactions = (reactions: any[]) => {
    if (reactions?.length) {
      const result = reactions.reduce((total, item) => total + (item.value || 0), 0);
      return result > 0 ? Utils.shortenLargeNumber(result) : null;
    }
    return null;
  };

  const openReactionsComponent = () => {
    dispatch(updatePostItem(displayPost));
    dispatch(toggleReactionsModal(!reactionsModalIsOpen));
  };

  const openCommentsComponent = () => {
    dispatch(updatePostItem(displayPost));
    dispatch(toggleCommentsModal(!commentsModalIsOpen));
  };

  const openUsersModal = (type: 'share' | 'save') => {
    setUsersModalType(type);
    setShowUsersModal(true);
  };

  const reactions = Utils.formattedReactions(displayPost?.reactions);
  const reactionCount = sumAllReactions(reactions);
  const commentsCount = Number(displayPost.commentsCount || 0);

  if (
    !reactionCount &&
    commentsCount === 0 &&
    (displayPost.sharesCount || 0) === 0 &&
    (displayPost.savesCount || 0) === 0
  ) {
    return null;
  }

  return (
    <div className="reactions-display">
      {showUsersModal && (
        <UsersModal postId={post._id} type={usersModalType} onClose={() => setShowUsersModal(false)} />
      )}
      <div className="reaction">
        <div className="likes-block" onClick={() => openReactionsComponent()}>
          <div className="likes-block-icons reactions-icon-display">
            {reactions.length > 0 &&
              reactions.map((reaction) => (
                <div className="tooltip-container" key={reaction?.type}>
                  <img
                    data-testid="reaction-img"
                    className="reaction-img"
                    src={`${reactionsMap[reaction?.type]}`}
                    alt=""
                    onMouseEnter={getPostReactions}
                  />
                  <div className="tooltip-container-text tooltip-container-bottom" data-testid="reaction-tooltip">
                    <p className="title">
                      <img className="title-img" src={`${reactionsMap[reaction?.type]}`} alt="" />
                      {Utils.firstLetterUpperCase(reaction.type)}
                    </p>
                    <div className="likes-block-icons-list">
                      {postReactions.length === 0 && <FaSpinner className="circle-notch" />}
                      {postReactions.length > 0 && (
                        <>
                          {postReactions.slice(0, 19).map((postReaction) => (
                            <div key={Utils.generateString(10)}>
                              {postReaction?.type === reaction?.type && (
                                <span key={postReaction?._id}>{postReaction?.username}</span>
                              )}
                            </div>
                          ))}
                          {postReactions.length > 20 && <span>and {postReactions.length - 20} others...</span>}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
          {reactionCount && (
            <span
              data-testid="reactions-count"
              className="tooltip-container reactions-count"
              onMouseEnter={getPostReactions}
            >
              {reactionCount}
              <div className="tooltip-container-text tooltip-container-likes-bottom" data-testid="tooltip-container">
                <div className="likes-block-icons-list">
                  {postReactions.length === 0 && <FaSpinner className="circle-notch" />}
                  {postReactions.length > 0 && (
                    <>
                      {postReactions.slice(0, 19).map((postReaction) => (
                        <span key={Utils.generateString(10)}>{postReaction?.username}</span>
                      ))}
                      {postReactions.length > 20 && <span>and {postReactions.length - 20} others...</span>}
                    </>
                  )}
                </div>
              </div>
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 ml-auto text-[#65676b] text-[15px]">
        <div className="comment tooltip-container" data-testid="comment-container" onClick={openCommentsComponent}>
          {commentsCount > 0 && (
            <span data-testid="comment-count" onMouseEnter={getPostCommentsNames}>
              {Utils.shortenLargeNumber(commentsCount)} {`${commentsCount === 1 ? 'Comment' : 'Comments'}`}
            </span>
          )}
          <div className="tooltip-container-text tooltip-container-comments-bottom" data-testid="comment-tooltip">
            <div className="likes-block-icons-list">
              {postCommentsNames.length === 0 && <FaSpinner className="circle-notch" />}
              {postCommentsNames.length > 0 && (
                <>
                  {postCommentsNames.slice(0, 19).map((names) => (
                    <span key={Utils.generateString(10)}>{names}</span>
                  ))}
                  {postCommentsNames.length > 20 && <span>and {postCommentsNames.length - 20} others...</span>}
                </>
              )}
            </div>
          </div>
        </div>
        {Number(displayPost.sharesCount) > 0 && (
          <div className="comment cursor-pointer hover:underline" onClick={() => openUsersModal('share')}>
            <span>
              {Utils.shortenLargeNumber(displayPost.sharesCount)}{' '}
              {`${displayPost.sharesCount === 1 ? 'Share' : 'Shares'}`}
            </span>
          </div>
        )}
        {Number(displayPost.savesCount) > 0 && (
          <div className="comment cursor-pointer hover:underline" onClick={() => openUsersModal('save')}>
            <span>
              {Utils.shortenLargeNumber(displayPost.savesCount)} {`${displayPost.savesCount === 1 ? 'Save' : 'Saves'}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReactionsAndCommentsDisplay;
