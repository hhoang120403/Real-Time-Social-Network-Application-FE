import Skeleton from 'react-loading-skeleton';

const PostSkeleton = () => {
  return (
    <div
      className="p-4 mt-4 mb-6 bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
      data-testid="posts-skeleton"
    >
      <div className="flex flex-col w-full">
        {/* Header Skeleton */}
        <div className="flex gap-3 items-start w-full mb-3">
          <div className="shrink-0">
            <Skeleton baseColor="#EFF1F6" circle width={50} height={50} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1 w-full">
                <Skeleton baseColor="#EFF1F6" width={120} height={18} />
                <Skeleton baseColor="#EFF1F6" width={80} height={14} />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full">
          {/* Content Skeleton */}
          <div className="flex flex-col gap-2 mb-4">
            <Skeleton baseColor="#EFF1F6" width="100%" height={16} />
            <Skeleton baseColor="#EFF1F6" width="100%" height={16} />
            <Skeleton baseColor="#EFF1F6" width="60%" height={16} />
          </div>

          {/* Media Skeleton */}
          <div className="w-full h-[300px] rounded-xl overflow-hidden mb-3">
            <Skeleton baseColor="#EFF1F6" height="100%" />
          </div>

          {/* Action Line Skeleton */}
          <div className="h-[0.5px] bg-[#e4e6eb] w-full my-4"></div>

          <div className="flex justify-between items-center px-2">
            <Skeleton baseColor="#EFF1F6" width={100} height={24} />
            <Skeleton baseColor="#EFF1F6" width={100} height={24} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default PostSkeleton;
