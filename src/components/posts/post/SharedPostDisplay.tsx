import Avatar from '@components/avatar/Avatar';
import { timeAgo } from '@services/utils/timeago.utils';
import { Utils } from '@services/utils/utils.service';
import type { PostItem } from '@app-types/post';

interface ISharedPostDisplayProps {
  sharedPost: Partial<PostItem>;
}

const SharedPostDisplay = ({ sharedPost }: ISharedPostDisplayProps) => {
  if (!sharedPost) return null;

  return (
    <div className="border border-[#e4e6eb] rounded-xl overflow-hidden mt-3 mb-3 hover:bg-[#f8f9fa] transition-colors cursor-pointer">
      <div className="p-3 pb-0">
        <div className="flex gap-2 items-center mb-2">
          <Avatar
            name={sharedPost?.username!}
            bgColor={sharedPost?.avatarColor!}
            textColor="#ffffff"
            size={36}
            avatarSrc={sharedPost?.profilePicture!}
          />
          <div className="flex flex-col">
            <span className="text-[14px] font-semibold text-[#050505] leading-none hover:underline">
              {sharedPost?.username}
            </span>
            <div className="flex items-center gap-1 text-[12px] text-[#65676b] mt-0.5">
              <span>{timeAgo.transform(sharedPost?.createdAt!)}</span>
            </div>
          </div>
        </div>

        {/* Post Text Content */}
        {sharedPost?.post && sharedPost?.bgColor === '#ffffff' && (
          <p className="text-[#050505] text-[14px] whitespace-pre-wrap wrap-break-word mb-3">
            {sharedPost?.post}
          </p>
        )}

        {/* Post with Background Color */}
        {sharedPost?.post && sharedPost?.bgColor !== '#ffffff' && (
          <div
            className="w-full min-h-[200px] flex items-center justify-center text-center p-6 text-white text-[20px] font-bold rounded-xl mb-3 overflow-y-auto break-all"
            style={{ backgroundColor: `${sharedPost?.bgColor}` }}
          >
            {sharedPost?.post}
          </div>
        )}
      </div>

      {/* Post Image Content */}
      {sharedPost?.imgId && !sharedPost?.gifUrl && sharedPost.bgColor === '#ffffff' && (
        <div className="w-full border-t border-[#e4e6eb]">
          <img
            className="w-full h-auto max-h-[500px] object-cover"
            src={`${Utils.getImage(sharedPost?.imgId!, sharedPost?.imgVersion!)}`}
            alt="Shared Post visual"
          />
        </div>
      )}

      {/* Post GIF Content */}
      {sharedPost?.gifUrl && sharedPost.bgColor === '#ffffff' && (
        <div className="w-full border-t border-[#e4e6eb]">
          <img className="w-full h-auto max-h-[500px] object-cover" src={`${sharedPost?.gifUrl}`} alt="Shared GIF" />
        </div>
      )}

      {/* Post Video Content */}
      {sharedPost?.videoId && sharedPost.bgColor === '#ffffff' && (
        <div className="w-full border-t border-[#e4e6eb] bg-black">
          <video
            className="w-full max-h-[500px]"
            src={`${Utils.getVideo(sharedPost?.videoId!, sharedPost?.videoVersion!)}`}
            controls
          />
        </div>
      )}
    </div>
  );
};

export default SharedPostDisplay;
