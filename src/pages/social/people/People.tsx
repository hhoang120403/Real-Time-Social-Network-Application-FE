import { useCallback, useEffect, useRef, useState } from 'react';
import './People.scss';
import { Utils } from '@services/utils/utils.service';
import { FaCircle } from 'react-icons/fa';
import Avatar from '@components/avatar/Avatar';
import type { IUser } from '@app-types/user';
import useInfiniteScroll from '@hooks/useInfiniteScroll';
import CardElementStats from '@components/card-element/CardElementStats';
import CardElementButtons from '@components/card-element/CardElementButtons';
import type { AppDispatch } from '@redux/store';
import { useDispatch } from 'react-redux';
import { userService } from '@services/api/user/user.service';
import { uniqBy } from 'lodash';
import useEffectOnce from '@hooks/useEffectOnce';
import { ProfileUtils } from '@services/utils/profile-utils.service';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@redux/store';
import { FollowersUtilsService } from '@services/utils/followers-utils.service';
import { socketService } from '@services/socket/socket.service';
import { followerService } from '@services/api/followers/follower.service';

const People = () => {
  const { profile } = useSelector((state: RootState) => state.user);
  const [users, setUsers] = useState<IUser[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [onlineUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const bottomLineRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  useInfiniteScroll(bodyRef, bottomLineRef, fetchData);

  const PAGE_SIZE = 10;

  function fetchData() {
    let pageNum = currentPage;
    if (currentPage <= Math.round(totalUsers / PAGE_SIZE)) {
      pageNum += 1;
      setCurrentPage(pageNum);
      getAllUsers();
    }
  }

  const getAllUsers = useCallback(async () => {
    const response = await userService.getAllUsers(currentPage);
    console.log(response.data.users);
    if (response.data.users.length > 0) {
      setUsers((prev) => {
        const result = [...prev, ...response.data.users];
        const allUsers = uniqBy(result, '_id');
        return allUsers;
      });
      setTotalUsers(response.data.totalUsers);
      setLoading(false);
    }
    try {
    } catch (error: any) {
      setLoading(false);
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  }, [currentPage, dispatch]);

  const getUserFollowing = async () => {
    try {
      const response = await followerService.getUserFollowing();
      setFollowing(response.data.following);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      Utils.dispatchNotification(error.response.data.message, 'error', dispatch);
    }
  };

  const followUser = async (user: IUser) => {
    try {
      FollowersUtilsService.followUser(user, dispatch);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const unFollowUser = async (user: IUser) => {
    try {
      const userData = user;
      userData.followersCount -= 1;
      socketService?.socket?.emit('unfollow user', userData);
      FollowersUtilsService.unfollowUser(user, profile!, dispatch);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  useEffectOnce(() => {
    getAllUsers();
    getUserFollowing();
  });

  useEffect(() => {
    FollowersUtilsService.socketIOFollowAndUnfollow(users, following, setFollowing, setUsers);
  }, [users, following]);

  return (
    <div className="card-container" ref={bodyRef}>
      <div className="people">People</div>
      {users.length > 0 && (
        <div className="card-element">
          {users.map((data) => (
            <div className="card-element-item" key={data?._id} data-testid="card-element-item">
              {Utils.checkIfUserIsOnline(data?.username, onlineUsers) && (
                <div className="card-element-item-indicator">
                  <FaCircle className="online-indicator" />
                </div>
              )}
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

      {loading && !users.length && <div className="card-element" style={{ height: '350px' }}></div>}

      {!loading && !users.length && <div className="empty-page">No user available</div>}

      <div ref={bottomLineRef} style={{ marginBlock: '80px', height: '50px' }}></div>
    </div>
  );
};

export default People;
