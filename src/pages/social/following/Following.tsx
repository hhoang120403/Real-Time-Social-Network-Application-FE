import Avatar from '@components/avatar/Avatar';
import { followerService } from '@services/api/followers/follower.service';
import { socketService } from '@services/socket/socket.service';
import { FollowersUtilsService } from '@services/utils/followers-utils.service';
import CardSkeleton from '@components/card-element/CardSkeleton';
import { ProfileUtils } from '@services/utils/profile-utils.service';
import { Utils } from '@services/utils/utils.service';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '@redux/store';
import { FaUserPlus, FaUserMinus, FaUserCheck } from 'react-icons/fa';

const Following = () => {
  const { profile } = useSelector((state: RootState) => state.user);
  const [following, setFollowing] = useState<any[]>([]);
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

  useEffect(() => {
    getUserFollowing();
  }, []);

  useEffect(() => {
    FollowersUtilsService.socketIORemoveFollowing(following, setFollowing);
  }, [following]);

  return (
    <div className="w-full min-h-screen bg-gray-50/30">
      <div className="max-w-[1240px] mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-none italic uppercase">
              Following
            </h2>
            <p className="text-gray-500 font-bold text-base">You are staying updated with these community members</p>
          </div>
          {following.length > 0 && (
            <div className="bg-indigo-50 text-indigo-600 px-8 py-3 rounded-2xl font-black text-sm border border-indigo-100 shadow-sm backdrop-blur-sm">
              <span className="opacity-70 mr-2">INTERESTS:</span>
              <span>{following.length} CONNECTIONS</span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && following.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Following Grid */}
        {following.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {following.map((followingUser: any) => {
              const data = followingUser.followingId || followingUser;
              return (
                <div
                  key={data?._id || Utils.generateString(10)}
                  className="group relative bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 flex flex-col h-[520px]"
                >
                  {/* Premium Header Background */}
                  <div
                    className="absolute top-0 left-0 w-full h-28 transform transition-transform duration-1000 group-hover:scale-110"
                    style={{ backgroundColor: data?.avatarColor || '#6366f1', opacity: 0.85 }}
                  />

                  {/* Avatar & Branding */}
                  <div className="relative mt-12 flex flex-col items-center">
                    <div
                      className="p-1.5 bg-white rounded-full shadow-2xl cursor-pointer hover:scale-105 transition-all duration-300 ring-4 ring-transparent group-hover:ring-indigo-100"
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
                        className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors cursor-pointer truncate"
                        onClick={() => ProfileUtils.navigateToProfile(data, navigate)}
                      >
                        {data?.username}
                      </h3>
                    </div>
                  </div>

                  {/* Network Stats Card */}
                  <div className="mx-8 my-6 p-5 bg-gray-50/80 rounded-[32px] grid grid-cols-3 gap-2 border border-gray-100/50">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Posts</span>
                      <span className="text-lg font-black text-gray-900">
                        {Utils.shortenLargeNumber(data?.postsCount || 0)}
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center border-x border-gray-200 px-2">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                        Following
                      </span>
                      <span className="text-lg font-black text-gray-900">
                        {Utils.shortenLargeNumber(data?.followingCount || 0)}
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                        Followers
                      </span>
                      <span className="text-lg font-black text-gray-900">
                        {Utils.shortenLargeNumber(data?.followersCount || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Action Buttons */}
                  <div className="mt-auto px-8 pb-10 flex flex-col gap-3">
                    <button
                      className="w-full h-[60px] rounded-2xl bg-linear-to-br from-indigo-600 to-violet-700 text-white font-black text-base shadow-[0_10px_25px_rgba(79,70,229,0.25)] hover:shadow-[0_15px_30px_rgba(79,70,229,0.4)] hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 group/btn"
                      onClick={() => ProfileUtils.navigateToProfile(data, navigate)}
                    >
                      <span>Explore Profile</span>
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
                      {Utils.checkIfUserIsFollowed(following, data?._id) ? (
                        <button
                          className="w-full h-12 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 group/unfollow"
                          onClick={() => unFollowUser(data)}
                        >
                          <FaUserCheck className="text-green-500 group-hover/unfollow:hidden" />
                          <FaUserMinus className="hidden group-hover/unfollow:block" />
                          <span className="group-hover/unfollow:hidden">Following</span>
                          <span className="hidden group-hover/unfollow:block text-red-600">Unfollow Member</span>
                        </button>
                      ) : (
                        <button
                          className="w-full h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-black text-sm hover:bg-indigo-100 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                          onClick={() => followUser(data)}
                        >
                          <FaUserPlus />
                          <span>Follow Back</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modern Empty State */}
        {!loading && !following.length && (
          <div className="flex justify-center items-center pt-8 pb-32 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white p-16 rounded-[48px] shadow-2xl border border-gray-100 flex flex-col items-center text-center max-w-xl w-full relative overflow-hidden group">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-50/50 rounded-full blur-3xl group-hover:bg-indigo-100/50 transition-colors duration-500" />

              <div className="w-32 h-32 bg-linear-to-br from-indigo-50 to-indigo-100 rounded-full flex items-center justify-center mb-12 relative shadow-inner">
                <div className="absolute inset-0 border-2 border-dashed border-indigo-200 rounded-full animate-[spin_30s_linear_infinite] opacity-50" />
                <FaUserPlus className="text-6xl text-indigo-600 relative z-10" />
              </div>

              <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight italic uppercase">Silent Feed</h3>
              <p className="text-gray-500 font-medium text-lg leading-relaxed mb-12">
                Your following list is waiting for a spark! Discover amazing creators and stay connected with what
                matters most.
              </p>

              <button
                className="px-12 py-5 bg-gray-900 text-white font-black rounded-[20px] hover:bg-indigo-600 transition-all duration-300 shadow-xl active:scale-95 flex items-center gap-3"
                onClick={() => navigate('/app/social/people')}
              >
                <span>Find People to Follow</span>
                <FaUserPlus className="text-xl" />
              </button>
            </div>
          </div>
        )}

        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default Following;
