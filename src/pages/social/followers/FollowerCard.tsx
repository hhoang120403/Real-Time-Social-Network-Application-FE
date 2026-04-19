import Avatar from '@components/avatar/Avatar';
import { FaUsers } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { followerService } from '@services/api/followers/follower.service';
import { Utils } from '@services/utils/utils.service';
import { userService } from '@services/api/user/user.service';
import { FollowersUtilsService } from '@services/utils/followers-utils.service';
import { ProfileUtils } from '@services/utils/profile-utils.service';
import { socketService } from '@services/socket/socket.service';
import type { RootState } from '@redux/store';

interface FollowerCardProps {
  userData: any;
}

const FollowerCard = ({ userData }: FollowerCardProps) => {
  const { profile } = useSelector((state: RootState) => state.user);
  const [followers, setFollowers] = useState<any[]>([]);
  const [user, setUser] = useState(userData);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { username } = useParams();

  const getUserFollowers = async () => {
    try {
      const response = await followerService.getUserFollowers(searchParams.get('id') || '');
      setFollowers(response.data.followers);
      setLoading(false);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const getUserProfileByUsername = async () => {
    try {
      const response = await userService.getUserProfileByUsername(
        username || '',
        searchParams.get('id') || '',
        searchParams.get('uId') || ''
      );
      setUser(response.data.user);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const blockUser = (userInfo: any) => {
    try {
      socketService?.socket?.emit('block user', { blockedUser: userInfo._id, blockedBy: user?._id });
      FollowersUtilsService.blockUser(userInfo, dispatch);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const unblockUser = (userInfo: any) => {
    try {
      socketService?.socket?.emit('unblock user', { blockedUser: userInfo._id, blockedBy: user?._id });
      FollowersUtilsService.unblockUser(userInfo, dispatch);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  useEffect(() => {
    getUserProfileByUsername();
    getUserFollowers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, searchParams.get('id')]);

  useEffect(() => {
    FollowersUtilsService.socketIOBlockAndUnblockCard(user, setUser);
  }, [user]);

  return (
    <div className="w-full">
      {followers.length > 0 && (
        <div className="max-w-[1240px] mx-auto py-8">
          {/* Header */}
          <div className="flex justify-between items-end mb-10 px-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none italic uppercase">
                Followers
              </h2>
              <p className="text-gray-400 font-bold text-sm">
                People who follow {username === profile?.username ? 'you' : username}
              </p>
            </div>
            <div className="bg-[#0866ff]/10 text-[#0866ff] px-6 py-2 rounded-2xl font-black text-sm border border-[#0866ff]/20 shadow-sm">
              {followers.length} {followers.length === 1 ? 'FOLLOWER' : 'FOLLOWERS'}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
            {followers.map((data) => (
              <div
                key={data?._id}
                className="group relative bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 flex flex-col h-[520px]"
              >
                {/* Header Gradient */}
                <div
                  className="absolute top-0 left-0 w-full h-24 transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundColor: data?.avatarColor || '#0866ff', opacity: 0.85 }}
                />

                {/* Avatar Section */}
                <div className="relative mt-8 flex flex-col items-center">
                  <div
                    className="p-1.5 bg-white rounded-full shadow-2xl cursor-pointer hover:scale-105 transition-all duration-300 ring-4 ring-transparent group-hover:ring-blue-50"
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

                  {/* Name */}
                  <div className="mt-6 text-center px-6">
                    <h3
                      className="text-xl font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors cursor-pointer truncate max-w-[240px]"
                      onClick={() => ProfileUtils.navigateToProfile(data, navigate)}
                    >
                      {data?.username}
                    </h3>
                  </div>
                </div>

                {/* Stats */}
                <div className="mx-6 my-6 p-4 bg-gray-50/50 rounded-3xl grid grid-cols-3 gap-2 border border-gray-100/50">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Posts</span>
                    <span className="text-[16px] font-black text-gray-900">
                      {Utils.shortenLargeNumber(data?.postsCount || 0)}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center border-x border-gray-200">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Followers</span>
                    <span className="text-[16px] font-black text-gray-900">
                      {Utils.shortenLargeNumber(data?.followersCount || 0)}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Following</span>
                    <span className="text-[16px] font-black text-gray-900">
                      {Utils.shortenLargeNumber(data?.followingCount || 0)}
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-auto px-6 pb-8 flex flex-col gap-3">
                  <button
                    className="w-full h-[56px] rounded-2xl bg-linear-to-br from-[#0866ff] to-[#0055d4] text-white font-black text-base shadow-[0_8px_20px_rgba(8,102,255,0.25)] hover:shadow-[0_12px_24px_rgba(8,102,255,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                    onClick={() => ProfileUtils.navigateToProfile(data, navigate)}
                  >
                    <span>View Profile</span>
                    <svg
                      className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>

                  {username === profile?.username && (
                    <div className="w-full">
                      {!Utils.checkIfUserIsBlocked(user?.blocked, data?._id) ? (
                        <button
                          className="w-full h-12 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 active:scale-95 transition-all duration-200"
                          onClick={() => blockUser(data)}
                        >
                          Block
                        </button>
                      ) : (
                        <button
                          className="w-full h-12 rounded-2xl bg-red-50 text-red-600 font-black text-sm hover:bg-red-100 active:scale-95 transition-all duration-200"
                          onClick={() => unblockUser(data)}
                        >
                          Unblock
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !followers.length && (
        <div className="flex justify-center items-center py-20 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-12 rounded-[40px] shadow-2xl border border-gray-100 flex flex-col items-center text-center max-w-md w-full relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="w-28 h-28 bg-linear-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 border-2 border-dashed border-blue-200 rounded-full animate-[spin_20s_linear_infinite]" />
              <FaUsers className="text-5xl text-blue-600 relative z-10" />
            </div>

            <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight italic uppercase">No Followers Yet</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              This profile doesn't have any followers yet. When someone follows, they will appear here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowerCard;
