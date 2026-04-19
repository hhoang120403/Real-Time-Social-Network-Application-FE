import { useCallback, useEffect, useState } from 'react';
import { Utils } from '@services/utils/utils.service';
import Avatar from '@components/avatar/Avatar';
import type { IUser } from '@app-types/user';
import type { AppDispatch, RootState } from '@redux/store';
import { useDispatch } from 'react-redux';
import { ProfileUtils } from '@services/utils/profile-utils.service';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { followerService } from '@services/api/followers/follower.service';
import { socketService } from '@services/socket/socket.service';
import { FollowersUtilsService } from '@services/utils/followers-utils.service';
import CardSkeleton from '@components/card-element/CardSkeleton';
import { FaUsers } from 'react-icons/fa';

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
    <div className="w-full min-h-screen bg-gray-50/30">
      <div className="max-w-[1240px] mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-none italic uppercase">
              Followers
            </h2>
            <p className="text-gray-500 font-bold text-base">Manage the people who are following your social updates</p>
          </div>
          {followers.length > 0 && (
            <div className="bg-[#0866ff]/10 text-[#0866ff] px-8 py-3 rounded-2xl font-black text-sm border border-[#0866ff]/20 shadow-sm backdrop-blur-sm">
              <span className="opacity-70 mr-2">FOLLOWERS:</span>
              <span>{followers.length} MEMBERS</span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && followers.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Content Grid */}
        {followers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {followers.map((follower) => {
              const data = follower.followerId || follower;
              return (
                <div
                  key={data?._id || Utils.generateString(10)}
                  className="group relative bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 flex flex-col h-[520px]"
                >
                  {/* Decorative Header Gradient */}
                  <div
                    className="absolute top-0 left-0 w-full h-28 transform transition-transform duration-1000 group-hover:scale-110"
                    style={{ backgroundColor: data?.avatarColor || '#0866ff', opacity: 0.85 }}
                  />

                  {/* Avatar Section */}
                  <div className="relative mt-12 flex flex-col items-center">
                    <div
                      className="p-1.5 bg-white rounded-full shadow-2xl cursor-pointer hover:scale-105 transition-all duration-300 ring-4 ring-transparent group-hover:ring-blue-100"
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
                        className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors cursor-pointer truncate"
                        onClick={() => ProfileUtils.navigateToProfile(data, navigate)}
                      >
                        {data?.username}
                      </h3>
                    </div>
                  </div>

                  {/* Stats Block */}
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

                  {/* Actions Section */}
                  <div className="mt-auto px-8 pb-10 flex flex-col gap-3">
                    <button
                      className="w-full h-[60px] rounded-2xl bg-linear-to-br from-[#0866ff] to-[#0055d4] text-white font-black text-base shadow-[0_10px_25px_rgba(8,102,255,0.25)] hover:shadow-[0_15px_30px_rgba(8,102,255,0.4)] hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 group/btn"
                      onClick={() => ProfileUtils.navigateToProfile(data, navigate)}
                    >
                      <span>View Profile</span>
                      <svg
                        className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </button>

                    <div className="w-full">
                      {!Utils.checkIfUserIsBlocked(blockedUsers, data?._id) ? (
                        <button
                          className="w-full h-12 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 hover:text-gray-900 active:scale-95 transition-all duration-200"
                          onClick={() => blockUser(data)}
                        >
                          Block Member
                        </button>
                      ) : (
                        <button
                          className="w-full h-12 rounded-2xl bg-red-50 text-red-600 font-black text-sm hover:bg-red-100 active:scale-95 transition-all duration-200"
                          onClick={() => unblockUser(data)}
                        >
                          Unblock Member
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && !followers.length && (
          <div className="flex justify-center items-center pt-8 pb-32 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white p-16 rounded-[48px] shadow-2xl border border-gray-100 flex flex-col items-center text-center max-w-lg w-full relative overflow-hidden group">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-50/50 rounded-full blur-3xl group-hover:bg-blue-100/50 transition-colors duration-500" />

              <div className="w-32 h-32 bg-linear-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mb-10 relative">
                <div className="absolute inset-0 border-2 border-dashed border-blue-200 rounded-full animate-[spin_25s_linear_infinite] opacity-50" />
                <FaUsers className="text-6xl text-blue-600 relative z-10" />
              </div>

              <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight italic uppercase">
                Growth Required
              </h3>
              <p className="text-gray-500 font-medium text-lg leading-relaxed mb-10">
                You don't have any followers at the moment. Share your thoughts and posts to start growing your
                community!
              </p>

              <button
                className="px-10 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-colors shadow-lg active:scale-95"
                onClick={() => navigate('/app/social/streams')}
              >
                Create a Post
              </button>
            </div>
          </div>
        )}

        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default Followers;
