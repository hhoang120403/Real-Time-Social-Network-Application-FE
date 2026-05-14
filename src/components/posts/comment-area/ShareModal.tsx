import Avatar from '@components/avatar/Avatar';
import Button from '@components/button/Button';
import { Utils } from '@services/utils/utils.service';
import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import type { RootState } from '@redux/store';
import type { PostItem } from '@app-types/post';

interface IShareModalProps {
  post: PostItem;
  onClose: () => void;
  onShare: (caption: string) => void;
}

const ShareModal = ({ post, onClose, onShare }: IShareModalProps) => {
  const { profile } = useSelector((state: RootState) => state.user);
  const [caption, setCaption] = useState('');

  return (
    <>
      <div className="fixed inset-0 bg-[#f3f2ef]/80 backdrop-blur-sm z-500" onClick={onClose}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px] bg-white rounded-xl shadow-xl z-501 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e4e6eb]">
          <h2 className="text-[20px] font-bold text-[#050505]">Share Post</h2>
          <div
            className="w-9 h-9 rounded-full bg-[#e4e6eb] flex items-center justify-center cursor-pointer hover:bg-[#d8dadf] transition-colors"
            onClick={onClose}
          >
            <FaTimes className="text-[#65676b]" />
          </div>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
          <div className="flex items-center gap-3">
            <Avatar
              name={profile?.username!}
              bgColor={profile?.avatarColor!}
              textColor="#ffffff"
              size={40}
              avatarSrc={profile?.profilePicture!}
            />
            <div className="flex flex-col">
              <span className="text-[15px] font-semibold text-[#050505]">{profile?.username}</span>
              <span className="text-[13px] text-[#65676b]">Public</span>
            </div>
          </div>

          <textarea
            className="w-full text-[18px] text-[#050505] outline-none resize-none min-h-[80px] placeholder:text-[#65676b]"
            placeholder="Say something about this..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />

          {/* Miniature preview of original post */}
          <div className="border border-[#e4e6eb] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Avatar
                name={post?.username!}
                bgColor={post?.avatarColor!}
                textColor="#ffffff"
                size={30}
                avatarSrc={post?.profilePicture!}
              />
              <span className="text-[14px] font-semibold">{post?.username}</span>
            </div>
            {post.post && <p className="text-[13px] text-[#65676b] line-clamp-2">{post.post}</p>}
            {post.imgId && !post.gifUrl && (
              <div className="mt-2 h-[100px] bg-[#f0f2f5] rounded-md overflow-hidden flex justify-center">
                <img className="h-full object-cover" src={Utils.getImage(post.imgId, post.imgVersion!)} alt="preview" />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e4e6eb]">
          <Button
            label="Share Now"
            className="w-full bg-(--primary-1) hover:bg-[#2851a3] text-white font-bold text-[15px] py-2 rounded-lg transition-colors"
            disabled={false}
            handleClick={() => onShare(caption)}
          />
        </div>
      </div>
    </>
  );
};

export default ShareModal;
