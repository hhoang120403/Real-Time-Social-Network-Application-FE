import type { IUser } from '@root/types/user';
import { createSearchParams, type NavigateFunction } from 'react-router-dom';

export class ProfileUtils {
  static navigateToProfile(data: IUser, navigate: NavigateFunction): void {
    const url = `/app/social/profile/${data?.username}?${createSearchParams({ id: data?._id, uId: data?.uId })}`;
    navigate(url);
  }
}
