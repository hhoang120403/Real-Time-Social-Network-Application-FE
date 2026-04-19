import { useCallback, useEffect, useRef, useState } from 'react';
import { Utils } from '@services/utils/utils.service';
import { FaCircle, FaUserPlus, FaUsers, FaCompass } from 'react-icons/fa';
import Avatar from '@components/avatar/Avatar';
import type { IUser } from '@app-types/user';
import useInfiniteScroll from '@hooks/useInfiniteScroll';
import type { AppDispatch } from '@redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { userService } from '@services/api/user/user.service';
import { uniqBy } from 'lodash';
import { ProfileUtils } from '@services/utils/profile-utils.service';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '@redux/store';
import { FollowersUtilsService } from '@services/utils/followers-utils.service';
import { followerService } from '@services/api/followers/follower.service';
import { ChatUtils } from '@services/utils/chat-utils.service';
import CardSkeleton from '@components/card-element/CardSkeleton';

const People = () => {
  const { profile } = useSelector((state: RootState) => state.user);
  const [users, setUsers] = useState<IUser[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const bottomLineRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  useInfiniteScroll(bottomLineRef, fetchData);

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
    try {
      const response = await userService.getAllUsers(currentPage);
      if (response.data.users.length > 0) {
        setUsers((prev) => {
          const result = [...prev, ...response.data.users];
          const allUsers = uniqBy(result, '_id');
          return allUsers;
        });
        setTotalUsers(response.data.totalUsers);
        setLoading(false);
      }
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
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const followUser = async (user: IUser) => {
    try {
      FollowersUtilsService.followUser(user, dispatch);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  // const unFollowUser = async (user: IUser) => {
  //   try {
  //     const userData = { ...user };
  //     userData.followersCount -= 1;
  //     socketService?.socket?.emit('unfollow user', userData);
  //     FollowersUtilsService.unfollowUser(user, profile!, dispatch);
  //   } catch (error: any) {
  //     Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
  //   }
  // };

  useEffect(() => {
    getAllUsers();
    getUserFollowing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    FollowersUtilsService.socketIOFollowAndUnfollow(users, following, setFollowing, setUsers);
    ChatUtils.usersOnline(setOnlineUsers);
  }, [users, following]);

  const filteredUsers = users.filter((user) => {
    const isFollowed = Utils.checkIfUserIsFollowed(following, user._id);
    const isBlockedByMe = Utils.checkIfUserIsBlocked(profile?.blocked || [], user._id);
    const isMe = user._id === profile?._id;
    return !isFollowed && !isBlockedByMe && !isMe;
  });

  return (
    <div className="w-full min-h-screen bg-gray-50/30">
      <div className="max-w-[1240px] mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-none italic uppercase">Discover</h2>
            <p className="text-gray-500 font-bold text-base">Find interesting people and grow your social network</p>
          </div>
          <div className="bg-emerald-50 text-emerald-600 px-8 py-3 rounded-2xl font-black text-sm border border-emerald-100 shadow-sm backdrop-blur-sm flex items-center gap-2">
            <FaCompass className="animate-pulse" />
            <span>{totalUsers} GLOBAL MEMBERS</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && filteredUsers.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* People Grid */}
        {filteredUsers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredUsers.map((data) => (
              <div
                key={data?._id}
                className="group relative bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 flex flex-col h-[520px]"
              >
                {/* Online Indicator */}
                {Utils.checkIfUserIsOnline(data?.username, onlineUsers) && (
                  <div className="absolute top-6 right-6 z-20 animate-in zoom-in duration-300">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg border border-emerald-50">
                      <FaCircle className="text-[8px] text-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                        Active Now
                      </span>
                    </div>
                  </div>
                )}

                {/* Header Background */}
                <div
                  className="absolute top-0 left-0 w-full h-28 transform transition-transform duration-1000 group-hover:scale-110"
                  style={{ backgroundColor: data?.avatarColor || '#10b981', opacity: 0.85 }}
                />

                {/* Avatar Section */}
                <div className="relative mt-12 flex flex-col items-center">
                  <div
                    className="p-1.5 bg-white rounded-full shadow-2xl cursor-pointer hover:scale-105 transition-all duration-300 ring-4 ring-transparent group-hover:ring-emerald-100"
                    onClick={() => ProfileUtils.navigateToProfile(data, navigate)}
                  >
                    <Avatar
                      name={data?.username}
                      bgColor={data?.avatarColor}
                      textColor="#ffffff"
                      size={120}
                      avatarSrc={data?.profilePicture}
                    />
                  </div>

                  <div className="mt-6 text-center px-8 w-full">
                    <h3
                      className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-emerald-600 transition-colors cursor-pointer truncate"
                      onClick={() => ProfileUtils.navigateToProfile(data, navigate)}
                    >
                      {data?.username}
                    </h3>
                  </div>
                </div>

                {/* Interaction Stats */}
                <div className="mx-8 my-6 p-5 bg-gray-50/80 rounded-[32px] grid grid-cols-3 gap-2 border border-gray-100/50">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Posts</span>
                    <span className="text-lg font-black text-gray-900">
                      {Utils.shortenLargeNumber(data?.postsCount || 0)}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center border-x border-gray-200 px-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Followers
                    </span>
                    <span className="text-lg font-black text-gray-900">
                      {Utils.shortenLargeNumber(data?.followersCount || 0)}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Following
                    </span>
                    <span className="text-lg font-black text-gray-900">
                      {Utils.shortenLargeNumber(data?.followingCount || 0)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto px-8 pb-10 flex flex-col gap-3">
                  <button
                    className="w-full h-[60px] rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 text-white font-black text-base shadow-[0_10px_25px_rgba(16,185,129,0.25)] hover:shadow-[0_15px_30px_rgba(16,185,129,0.4)] hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 group/btn"
                    onClick={() => ProfileUtils.navigateToProfile(data, navigate)}
                  >
                    <span>View Profile</span>
                    <svg
                      className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>

                  <button
                    className="w-full h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-black text-sm hover:bg-emerald-100 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                    onClick={() => followUser(data)}
                  >
                    <FaUserPlus />
                    <span>Follow Member</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredUsers.length === 0 && (
          <div className="flex justify-center items-center pt-8 pb-32 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white p-16 rounded-[48px] shadow-2xl border border-gray-100 flex flex-col items-center text-center max-w-xl w-full relative overflow-hidden group">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-50/50 rounded-full blur-3xl group-hover:bg-emerald-100/50 transition-colors duration-500" />

              <div className="w-32 h-32 bg-linear-to-br from-emerald-50 to-emerald-100 rounded-full flex items-center justify-center mb-12 relative">
                <div className="absolute inset-0 border-2 border-dashed border-emerald-200 rounded-full animate-[spin_35s_linear_infinite] opacity-50" />
                <FaUsers className="text-6xl text-emerald-600 relative z-10" />
              </div>

              <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight italic uppercase">World Explored</h3>
              <p className="text-gray-500 font-medium text-lg leading-relaxed mb-12">
                It seems you've already connected with everyone available in your network. Check back later for new
                suggestions!
              </p>

              <button
                className="px-12 py-5 bg-gray-900 text-white font-black rounded-[20px] hover:bg-emerald-600 transition-all duration-300 shadow-xl active:scale-95 flex items-center gap-3"
                onClick={() => getAllUsers()}
              >
                <span>Refresh Discover</span>
                <FaCompass className="text-xl" />
              </button>
            </div>
          </div>
        )}

        {/* Global Bottom Ref for Infinite Scroll */}
        <div ref={bottomLineRef} className="h-32 flex items-center justify-center mt-12">
          {loading && users.length > 0 && (
            <div className="p-3 bg-white rounded-full shadow-lg border border-gray-100 animate-bounce">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default People;
