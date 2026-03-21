import ReactionWrapper from '@components/posts/modal-wrappers/reaction-wrapper/ReactionWrapper';
import '@components/posts/reactions/reactions-modal/ReactionsModal.scss';
import ReactionList from './reaction-list/ReactionList';
import { useState } from 'react';
import type { FormattedReaction } from '@app-types/reactions';
import { reactionsColor, reactionsMap } from '@services/utils/static.data';
import { Utils } from '@services/utils/utils.service';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@redux/store';
import { postService } from '@services/api/post/post.service';
import { filter, orderBy, some } from 'lodash';
import useEffectOnce from '@hooks/useEffectOnce';
import { closeModal } from '@redux/reducers/modal/modal.reducer';
import { clearPost } from '@redux/reducers/post/post.reducer';
import type { ReactionType } from '@app-types/reaction';

const ReactionsModal = () => {
  const { _id, reactions } = useSelector((state: RootState) => state.post);
  const [activeViewAllTab, setActiveViewAllTab] = useState<boolean>(true);
  const [formattedReactions, setFormattedReactions] = useState<FormattedReaction[]>([]);
  const [reactionType, setReactionType] = useState<string>('');
  const [reactionColor, setReactionColor] = useState<string>('');
  const [postReactions, setPostReactions] = useState<any[]>([]);
  const [reactionsOfPost, setReactionsOfPost] = useState<any[]>([]);
  const dispatch = useDispatch<AppDispatch>();

  const getPostReactions = async () => {
    try {
      const response = await postService.getPostReactions(_id!);
      const orderedPosts = orderBy(response.data?.reactions, ['createdAt'], ['desc']);
      setPostReactions(orderedPosts);
      setReactionsOfPost(orderedPosts);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const closeReactionsModal = () => {
    dispatch(closeModal());
    dispatch(clearPost());
  };

  const viewAll = () => {
    setActiveViewAllTab(true);
    setReactionType('');
    setPostReactions(reactionsOfPost);
  };

  const reactionList = (type: ReactionType) => {
    setActiveViewAllTab(false);
    setReactionType(type);
    const exist = some(reactionsOfPost, (reaction) => reaction.type === type);
    const filteredReactions = exist ? filter(reactionsOfPost, (reaction) => reaction.type === type) : [];
    setPostReactions(filteredReactions);
    setReactionColor(reactionsColor[type]);
  };

  useEffectOnce(() => {
    getPostReactions();
    setFormattedReactions(Utils.formattedReactions(reactions!));
  });

  return (
    <>
      <ReactionWrapper closeModal={closeReactionsModal}>
        <div className="modal-reactions-header-tabs">
          <ul className="modal-reactions-header-tabs-list">
            <li className={`${activeViewAllTab ? 'activeViewAllTab' : 'all'}`} onClick={viewAll}>
              All
            </li>
            {formattedReactions.map((reaction, index) => (
              <li
                key={index}
                className={`${reactionType === reaction?.type ? 'activeTab' : ''}`}
                style={{ color: `${reaction?.type === reactionType ? reactionColor : ''}` }}
                onClick={() => reactionList(reaction?.type as ReactionType)}
              >
                <img src={`${reactionsMap[reaction?.type]}`} alt="" />
                <span>{Utils.shortenLargeNumber(reaction?.value)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="modal-reactions-list">
          <ReactionList postReactions={postReactions} />
        </div>
      </ReactionWrapper>
    </>
  );
};

export default ReactionsModal;
