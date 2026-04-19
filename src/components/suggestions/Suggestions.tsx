import Avatar from '@components/avatar/Avatar';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@redux/store';
import { useNavigate } from 'react-router-dom';
import { Utils } from '@services/utils/utils.service';
import { ProfileUtils } from '@services/utils/profile-utils.service';
import { FollowersUtilsService } from '@services/utils/followers-utils.service';
import type { IUser } from '@app-types/user';
import { filter } from 'lodash';
import { addToSuggestions } from '@redux/reducers/suggestions/suggestions.reducer';
import { socketService } from '@services/socket/socket.service';

const Suggestions = () => {
  const { suggestions, user } = useSelector((state: RootState) => state);
  const [users, setUsers] = useState<any[]>([]);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const followUser = async (userParam: IUser) => {
    try {
      FollowersUtilsService.followUser(userParam, dispatch);
      const result = filter(users, (data) => data?._id !== userParam?._id);
      setUsers(result);
      dispatch(addToSuggestions({ users: result, isLoading: false }));
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  useEffect(() => {
    let filteredUsers = suggestions?.users || [];
    if (user?.profile) {
      filteredUsers = filter(filteredUsers, (suggestionUser: any) => {
        const isBlocked = Utils.checkIfUserIsBlocked(user.profile?.blocked || [], suggestionUser._id);
        const isBlockedBy = Utils.checkIfUserIsBlocked(user.profile?.blockedBy || [], suggestionUser._id);
        return !isBlocked && !isBlockedBy;
      });
    }
    setUsers(filteredUsers);
  }, [suggestions, user?.profile]);

  useEffect(() => {
    const handleAddFollower = (data: any) => {
      setUsers((prevUsers) => {
        const result = filter(prevUsers, (user) => user?._id !== data?._id);
        if (result.length !== prevUsers.length) {
          dispatch(addToSuggestions({ users: result, isLoading: false }));
        }
        return result;
      });
    };
    socketService?.socket?.on('add follower', handleAddFollower);

    return () => {
      socketService?.socket?.off('add follower', handleAddFollower);
    };
  }, [dispatch]);

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#e4e6eb] overflow-hidden" data-testid="suggestions-container">
      <div className="px-4 py-3 border-b border-[#f0f2f5]">
        <h3 className="text-[17px] font-bold text-[#050505]">Suggestions</h3>
      </div>

      <div className="p-2">
        <div className="flex flex-col gap-1">
          {users?.map((user) => (
            <div 
              data-testid="suggestions-item" 
              className="flex items-center gap-3 p-2 hover:bg-[#f2f3f5] rounded-xl transition-colors group cursor-default" 
              key={user?._id}
            >
              <div 
                className="shrink-0 cursor-pointer"
                onClick={() => ProfileUtils.navigateToProfile(user, navigate)}
              >
                <Avatar
                  name={user?.username}
                  bgColor={user?.avatarColor}
                  textColor="#ffffff"
                  size={40}
                  avatarSrc={user?.profilePicture}
                />
              </div>
              <div className="flex-1 min-w-0 pr-1">
                <div 
                  className="text-[15px] font-bold text-[#050505] truncate hover:underline cursor-pointer leading-tight"
                  onClick={() => ProfileUtils.navigateToProfile(user, navigate)}
                >
                  {user?.username}
                </div>
                {/* Optional: Add common friends or location here if available in your logic */}
                <div className="text-[13px] text-[#65676b] truncate">Recommended</div>
              </div>
              <div className="shrink-0">
                <button
                  className="bg-[#e7f3ff] hover:bg-[#dbeafe] text-[#1877f2] font-semibold text-[14px] px-4 py-1.5 rounded-lg transition-colors active:scale-95"
                  onClick={(e) => {
                    e.stopPropagation();
                    followUser(user);
                  }}
                >
                  Follow
                </button>
              </div>
            </div>
          ))}

          {users?.length === 0 && (
            <div className="py-8 text-center text-[#65676b] text-[14px]">
              No new suggestions
            </div>
          )}
        </div>

        {users?.length > 6 && (
          <div 
            className="mt-2 p-2 text-center text-[#1877f2] font-semibold text-[15px] hover:bg-[#f2f3f5] rounded-lg cursor-pointer transition-colors"
            onClick={() => navigate('/app/social/people')}
          >
            View More
          </div>
        )}
      </div>
    </div>
  );
};

export default Suggestions;
