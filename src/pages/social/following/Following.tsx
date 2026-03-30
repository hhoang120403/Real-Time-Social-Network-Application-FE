import '@pages/social/following/Following.scss';
import Avatar from '@components/avatar/Avatar';
import CardElementButtons from '@components/card-element/CardElementButtons';
import CardElementStats from '@components/card-element/CardElementStats';
import useEffectOnce from '@hooks/useEffectOnce';
import { followerService } from '@services/api/followers/follower.service';
import { socketService } from '@services/socket/socket.service';
import { FollowersUtilsService } from '@services/utils/followers-utils.service';
import { ProfileUtils } from '@services/utils/profile-utils.service';
import { Utils } from '@services/utils/utils.service';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '@redux/store';

const Following = () => {
  const { profile } = useSelector((state: RootState) => state.user);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getUserFollowing = async () => {
    try {
      const response = await followerService.getUserFollowing();
      setFollowing(response.data.following);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const followUser = async (user: any) => {
    try {
      FollowersUtilsService.followUser(user, dispatch);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const unFollowUser = async (user: any) => {
    try {
      socketService?.socket?.emit('unfollow user', user);
      FollowersUtilsService.unfollowUser(user, profile!, dispatch);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  useEffectOnce(() => {
    getUserFollowing();
  });

  useEffect(() => {
    FollowersUtilsService.socketIORemoveFollowing(following, setFollowing);
  }, [following]);

  return (
    <div className="card-container">
      <div className="people">Following</div>
      {following.length > 0 && (
        <div className="card-element">
          {following.map((data: any) => (
            <div className="card-element-item" key={Utils.generateString(10)} data-testid="card-element-item">
              <div className="card-element-header">
                <div className="card-element-header-bg"></div>
                <Avatar
                  name={data?.username}
                  bgColor={data?.avatarColor}
                  textColor="#ffffff"
                  size={120}
                  avatarSrc={data?.profilePicture}
                />
                <div className="card-element-header-text">
                  <span className="card-element-header-name">{data?.username}</span>
                </div>
              </div>
              <CardElementStats
                postsCount={data?.postsCount}
                followersCount={data?.followersCount}
                followingCount={data?.followingCount}
              />
              <CardElementButtons
                isChecked={Utils.checkIfUserIsFollowed(following, data?._id)}
                btnTextOne="Follow"
                btnTextTwo="Unfollow"
                onClickBtnOne={() => followUser(data)}
                onClickBtnTwo={() => unFollowUser(data)}
                onNavigateToProfile={() => ProfileUtils.navigateToProfile(data, navigate)}
              />
            </div>
          ))}
        </div>
      )}

      {loading && !following.length && <div className="card-element" style={{ height: '350px' }}></div>}

      {!loading && !following.length && (
        <div className="empty-page" data-testid="empty-page">
          You have no following
        </div>
      )}

      <div style={{ marginBottom: '80px', height: '50px' }}></div>
    </div>
  );
};
export default Following;
