import '@components/posts/reactions/Reaction.scss';
import { reactionsMap } from '@services/utils/static.data';
import { Utils } from '@services/utils/utils.service';
import type { ReactionType } from '@app-types/reaction';

interface IReactionProps {
  handleClick: (reaction: ReactionType) => void;
  showLabel?: boolean;
}

const Reactions = ({ handleClick, showLabel = true }: IReactionProps) => {
  const reactionList = ['like', 'love', 'wow', 'happy', 'sad', 'angry'];

  return (
    <div className="reactions" data-testid="reactions">
      <ul>
        {reactionList.map((reaction, index) => (
          <li key={index} onClick={() => handleClick(reaction as ReactionType)} data-testid="reaction">
            {showLabel && <label>{Utils.firstLetterUpperCase(reaction)}</label>}
            <img src={reactionsMap[reaction as ReactionType]} alt="" />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reactions;
