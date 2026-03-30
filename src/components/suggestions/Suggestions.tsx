import Avatar from '@components/avatar/Avatar';
import Button from '@components/button/Button';
import '@components/suggestions/Suggestions.scss';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@redux/store';
import { useNavigate } from 'react-router-dom';
import { Utils } from '@services/utils/utils.service';
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
    <div className="suggestions-list-container" data-testid="suggestions-container">
      <div className="suggestions-header">
        <div className="title-text">Suggestions</div>
      </div>
      <hr />
      <div className="suggestions-container">
        <div className="suggestions">
          {users?.map((user) => (
            <div data-testid="suggestions-item" className="suggestions-item" key={user?._id}>
              <Avatar
                name={user?.username}
                bgColor={user?.avatarColor}
                textColor="#ffffff"
                size={40}
                avatarSrc={user?.profilePicture}
              />
              <div className="title-text">{user?.username}</div>
              <div className="add-icon">
                <Button
                  label="Follow"
                  className="button follow"
                  disabled={false}
                  handleClick={() => followUser(user)}
                />
              </div>
            </div>
          ))}
        </div>
        {users?.length > 6 && (
          <div className="view-more" onClick={() => navigate('/app/social/people')}>
            View More
          </div>
        )}
      </div>
    </div>
  );
};

export default Suggestions;
