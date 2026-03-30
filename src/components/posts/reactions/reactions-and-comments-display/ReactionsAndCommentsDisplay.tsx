import { FaSpinner } from 'react-icons/fa';
// import type { PostItem } from '@app-types/post';
import '@components/posts/reactions/reactions-and-comments-display/ReactionsAndCommentsDisplay.scss';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@redux/store';
import { Utils } from '@services/utils/utils.service';
import { useEffect, useState } from 'react';
import { postService } from '@services/api/post/post.service';
import { reactionsMap } from '@services/utils/static.data';
import type { FormattedReaction } from '@app-types/reactions';
import { updatePostItem } from '@redux/reducers/post/post.reducer';
import { toggleCommentsModal, toggleReactionsModal } from '@redux/reducers/modal/modal.reducer';

interface IReactionsAndCommentsDisplayProps {
  post: any;
}

const ReactionsAndCommentsDisplay = ({ post }: IReactionsAndCommentsDisplayProps) => {
  const { reactionsModalIsOpen, commentsModalIsOpen } = useSelector((state: RootState) => state.modal);
  const [postReactions, setPostReactions] = useState<any[]>([]);
  const [reactions, setReactions] = useState<FormattedReaction[]>([]);
  const [postCommentsNames, setPostCommentsNames] = useState<any[]>([]);
  const dispatch = useDispatch<AppDispatch>();

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
      const result = reactions.map((item) => item.value).reduce((total, value) => total + value, 0);
      return Utils.shortenLargeNumber(result);
    }
  };

  const openReactionsComponent = () => {
    dispatch(updatePostItem(post));
    dispatch(toggleReactionsModal(!reactionsModalIsOpen));
  };

  const openCommentsComponent = () => {
    dispatch(updatePostItem(post));
    dispatch(toggleCommentsModal(!commentsModalIsOpen));
  };

  useEffect(() => {
    setReactions(Utils.formattedReactions(post?.reactions));
  }, [post]);

  return (
    <div className="reactions-display">
      <div className="reaction">
        <div className="likes-block">
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
          <span
            data-testid="reactions-count"
            className="tooltip-container reactions-count"
            onMouseEnter={getPostReactions}
            onClick={() => openReactionsComponent()}
          >
            {sumAllReactions(reactions)}
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
        </div>
      </div>
      <div className="comment tooltip-container" data-testid="comment-container" onClick={openCommentsComponent}>
        {post.commentsCount > 0 && (
          <span data-testid="comment-count" onMouseEnter={getPostCommentsNames}>
            {Utils.shortenLargeNumber(post.commentsCount)} {`${post.commentsCount === 1 ? 'Comment' : 'Comments'}`}
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
    </div>
  );
};

export default ReactionsAndCommentsDisplay;
