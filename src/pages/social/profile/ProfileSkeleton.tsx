import BackgroundHeaderSkeleton from '@components/background-header/BackgroundHeaderSkeleton';
import PostSkeleton from '@components/posts/post/PostSkeleton';
import PostFormSkeleton from '@components/posts/post-form/PostFormSkeleton';
import { tabItems } from '@services/utils/static.data';

const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen max-w-[1152px] mx-auto overflow-y-auto px-0 sm:px-4">
      <div className="flex flex-col gap-6">
        <div className="w-full h-fit">
          <BackgroundHeaderSkeleton tabItems={tabItems(true, true)} />
        </div>
        <div className="w-full px-4 sm:px-0 pb-20">
          <div className="flex flex-col gap-5">
            <div className="mb-2">
              <PostFormSkeleton />
            </div>
            {[1, 2, 3].map((index) => (
              <div key={index}>
                <PostSkeleton />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfileSkeleton;
