import { Utils } from '@services/utils/utils.service';
import CountContainerSkeleton from '@components/timeline/CountContainerSkeleton';
import '@components/timeline/Timeline.scss';

interface CountContainerProps {
  followingCount: number;
  followersCount: number;
  loading: boolean;
}

const CountContainer = ({ followingCount, followersCount, loading }: CountContainerProps) => {
  return (
    <>
      {loading ? (
        <CountContainerSkeleton />
      ) : (
        <div className="count-container" data-testid="count-container">
          <div className="followers-count">
            <span className="count" data-testid="info">
              {Utils.shortenLargeNumber(followersCount)}
            </span>
            <p>{`${followersCount > 1 ? 'Followers' : 'Follower'}`}</p>
          </div>
          <div className="vertical-line"></div>
          <div className="following-count">
            <span className="count" data-testid="info">
              {Utils.shortenLargeNumber(followingCount)}
            </span>
            <p>Following</p>
          </div>
        </div>
      )}
    </>
  );
};

export default CountContainer;
