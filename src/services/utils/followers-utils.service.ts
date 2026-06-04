import type { IUser } from '@app-types/user';
import type { AppDispatch } from '@redux/store';
import { followerService } from '@services/api/followers/follower.service';
import { Utils } from './utils.service';
import { socketService } from '@services/socket/socket.service';
import { cloneDeep, filter, find, findIndex } from 'lodash';
import { addUser } from '@redux/reducers/user/user.reducer';

export class FollowersUtilsService {
  static async followUser(user: IUser, dispatch: AppDispatch) {
    const response = await followerService.followUser(user._id);
    Utils.dispatchNotification(response.data.message, 'success', dispatch);
  }

  static async unfollowUser(user: IUser, profile: IUser, dispatch: AppDispatch) {
    const response = await followerService.unfollowUser(user._id, profile._id);
    Utils.dispatchNotification(response.data.message, 'success', dispatch);
  }

  static async blockUser(user: IUser, dispatch: AppDispatch) {
    const response = await followerService.blockUser(user._id);
    Utils.dispatchNotification(response.data.message, 'success', dispatch);
  }

  static async unblockUser(user: IUser, dispatch: AppDispatch) {
    const response = await followerService.unblockUser(user._id);
    Utils.dispatchNotification(response.data.message, 'success', dispatch);
  }

  static socketIOFollowAndUnfollow(
    users: IUser[],
    followers: any[],
    setFollowers: (value: any) => void,
    setUsers: (value: any) => void
  ) {
    socketService?.socket?.on('add follower', (data: any) => {
      const userData = find(users, (user) => user._id === data?._id);
      if (userData) {
        const updatedFollowers = [...followers, data];
        setFollowers(updatedFollowers);
        FollowersUtilsService.updateSingleUser(users, userData, data, setUsers);
      }
    });

    socketService?.socket?.on('remove follower', (data: any) => {
      const userData = find(users, (user) => user._id === data?._id);
      if (userData) {
        const updatedFollowers = filter(followers, (follower) => follower._id !== data?._id);
        setFollowers(updatedFollowers);
        FollowersUtilsService.updateSingleUser(users, userData, data, setUsers);
      }
    });
  }

  static socketIORemoveFollowing(following: any[], setFollowing: (value: any) => void) {
    socketService?.socket?.on('remove follower', (data: any) => {
      const updatedFollowing = filter(following, (user) => user._id !== data?._id);
      setFollowing(updatedFollowing);
    });
  }

  static socketIOBlockAndUnblock(
    profile: IUser,
    token: string,
    setBlockedUsers: (value: any) => void,
    dispatch: AppDispatch
  ) {
    socketService?.socket?.on('blocked user id', (data: any) => {
      const user = FollowersUtilsService.addBlockedUser(profile, data);
      setBlockedUsers(user.blocked);
      dispatch(addUser({ token, profile: user }));
    });

    socketService?.socket?.on('unblocked user id', (data: any) => {
      const user = FollowersUtilsService.removeBlockedUser(profile, data);
      setBlockedUsers(user.blocked);
      dispatch(addUser({ token, profile: user }));
    });
  }

  static socketIOBlockAndUnblockCard(user: any, setUser: (value: any) => void) {
    socketService?.socket?.on('blocked user id', (data: any) => {
      const userData = FollowersUtilsService.addBlockedUser(user, data);
      setUser(userData);
    });

    socketService?.socket?.on('unblocked user id', (data: any) => {
      const userData = FollowersUtilsService.removeBlockedUser(user, data);
      setUser(userData);
    });
  }

  static addBlockedUser(user: any, data: any) {
    user = cloneDeep(user);
    if (user?._id === data.blockedBy) {
      user.blocked.push(data.blockedUser);
    }

    if (user?._id === data.blockedUser) {
      user.blockedBy.push(data.blockedBy);
    }

    return user;
  }

  static removeBlockedUser(profile: any, data: any) {
    profile = cloneDeep(profile);
    if (profile?._id === data.blockedBy) {
      profile.blocked = [...Utils.removeUserFromList(profile.blocked, data.blockedUser)];
    }

    if (profile?._id === data.blockedUser) {
      profile.blockedBy = [...Utils.removeUserFromList(profile.blockedBy, data.blockedBy)];
    }

    return profile;
  }

  static updateSingleUser(users: any[], userData: any, followerData: any, setUsers: (value: any) => void) {
    users = cloneDeep(users);
    userData.followersCount = followerData.followersCount;
    userData.followingCount = followerData.followingCount;
    userData.postsCount =
      followerData.postsCount !== undefined
        ? followerData.postsCount
        : followerData.postCount !== undefined
          ? followerData.postCount
          : userData.postsCount;
    const userIndex = findIndex(users, ['_id', userData?._id]);
    if (userIndex > -1) {
      users.splice(userIndex, 1, userData);
      setUsers(users);
    }
  }
}
