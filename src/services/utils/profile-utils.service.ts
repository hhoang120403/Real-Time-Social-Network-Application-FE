import type { IUser } from '@root/types/user';
import { createSearchParams, type NavigateFunction } from 'react-router-dom';

export class ProfileUtils {
  static navigateToProfile(data: IUser, navigate: NavigateFunction): void {
    const url = this.getProfileUrl(data);
    navigate(url);
  }

  static getProfileUrl(data: IUser): string {
    return `/app/social/profile/${data?.username}?${createSearchParams({ id: data?._id, uId: data?.uId, tab: 'timeline' })}`;
  }
}
