import { Utils } from '@services/utils/utils.service';

interface ICardElementStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

const CardElementStats = ({ postsCount, followersCount, followingCount }: ICardElementStats) => {
  return (
    <div className="card-element-stats">
      <div className="card-element-stats-group">
        <p className="card-element-stats-group-title">Posts</p>
        <h5 className="card-element-stats-group-info" data-testid="info">
          {Utils.shortenLargeNumber(postsCount)}
        </h5>
      </div>
      <div className="card-element-stats-group">
        <p className="card-element-stats-group-title">Followers</p>
        <h5 className="card-element-stats-group-info" data-testid="info">
          {Utils.shortenLargeNumber(followersCount)}
        </h5>
      </div>
      <div className="card-element-stats-group">
        <p className="card-element-stats-group-title">Following</p>
        <h5 className="card-element-stats-group-info" data-testid="info">
          {Utils.shortenLargeNumber(followingCount)}
        </h5>
      </div>
    </div>
  );
};

export default CardElementStats;
