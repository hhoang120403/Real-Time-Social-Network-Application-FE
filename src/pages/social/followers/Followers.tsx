import { useCallback, useEffect, useState } from 'react';
import './Followers.scss';
import { Utils } from '@services/utils/utils.service';
import Avatar from '@components/avatar/Avatar';
import type { IUser } from '@app-types/user';
import CardElementStats from '@components/card-element/CardElementStats';
import CardElementButtons from '@components/card-element/CardElementButtons';
import type { AppDispatch, RootState } from '@redux/store';
import { useDispatch } from 'react-redux';
import { ProfileUtils } from '@services/utils/profile-utils.service';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { followerService } from '@services/api/followers/follower.service';
import { socketService } from '@services/socket/socket.service';
import { FollowersUtilsService } from '@services/utils/followers-utils.service';

const Followers = () => {
  const { profile, token } = useSelector((state: RootState) => state.user);
  const [followers, setFollowers] = useState<IUser[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const getUserFollowers = useCallback(async () => {
    try {
      if (profile) {
        const response = await followerService.getUserFollowers(profile?._id);
        setFollowers(response.data.followers);
        setLoading(false);
      }
    } catch (error: any) {
      setLoading(false);
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  }, [profile, dispatch]);

  const blockUser = async (user: any) => {
    try {
      socketService?.socket?.emit('block user', { blockedUser: user._id, blockedBy: profile?._id });
      FollowersUtilsService.blockUser(user, dispatch);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const unblockUser = async (user: any) => {
    try {
      socketService?.socket?.emit('unblock user', { blockedUser: user._id, blockedBy: profile?._id });
      FollowersUtilsService.unblockUser(user, dispatch);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  useEffect(() => {
    getUserFollowers();
    setBlockedUsers(profile?.blocked || []);
  }, [getUserFollowers, profile]);

  useEffect(() => {
    FollowersUtilsService.socketIOBlockAndUnblock(profile!, token!, setBlockedUsers, dispatch);
  }, [dispatch, profile, token]);

  return (
    <div className="card-container">
      <div className="followers">Followers</div>
      {followers.length > 0 && (
        <div className="card-element">
          {followers.map((data) => (
            <div className="card-element-item" key={data?._id} data-testid="card-element-item">
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
                isChecked={Utils.checkIfUserIsBlocked(blockedUsers, data?._id)}
                btnTextOne="Block"
                btnTextTwo="Unblock"
                onClickBtnOne={() => blockUser(data)}
                onClickBtnTwo={() => unblockUser(data)}
                onNavigateToProfile={() => ProfileUtils.navigateToProfile(data, navigate)}
              />
            </div>
          ))}
        </div>
      )}

      {loading && !followers.length && <div className="card-element" style={{ height: '350px' }}></div>}

      {!loading && !followers.length && (
        <div className="empty-page" data-testid="empty-page">
          You have no followers
        </div>
      )}

      <div style={{ marginBottom: '80px', height: '50px' }}></div>
    </div>
  );
};

export default Followers;
