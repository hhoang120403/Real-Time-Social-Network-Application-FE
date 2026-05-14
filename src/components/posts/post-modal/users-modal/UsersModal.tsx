import Avatar from '@components/avatar/Avatar';
import { Utils } from '@services/utils/utils.service';
import { useState } from 'react';
import useEffectOnce from '@hooks/useEffectOnce';
import { postService } from '@services/api/post/post.service';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@redux/store';
import { FaSpinner, FaShareAlt, FaBookmark, FaTimes } from 'react-icons/fa';
import { createPortal } from 'react-dom';

interface UsersModalProps {
  postId: string;
  type: 'share' | 'save';
  onClose: () => void;
}

const UsersModal = ({ postId, type, onClose }: UsersModalProps) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();

  const fetchUsers = async () => {
    try {
      const response =
        type === 'share' ? await postService.getPostShares(postId) : await postService.getPostSaves(postId);
      setUsers(response.data.users);
      setLoading(false);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message || 'Error fetching users', 'error', dispatch);
      setLoading(false);
    }
  };

  useEffectOnce(() => {
    fetchUsers();
  });

  const modalContent = (
    <div className="fixed inset-0 z-2000 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative w-[95%] max-w-[500px] bg-[#1c1e21] rounded-xl shadow-2xl overflow-hidden animate-zoom-in border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {type === 'share' ? (
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FaShareAlt className="text-blue-500 text-lg" />
              </div>
            ) : (
              <div className="p-2 bg-green-500/10 rounded-lg">
                <FaBookmark className="text-green-500 text-lg" />
              </div>
            )}
            <h3 className="text-white font-bold text-lg">People who {type === 'share' ? 'shared' : 'saved'}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* User List */}
        <div className="max-height-[450px] overflow-y-auto p-2 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <FaSpinner className="animate-spin text-4xl text-blue-500" />
              <p className="text-gray-400 font-medium">Loading user list...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-gray-500 text-lg">No interactions yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors group"
                >
                  <Avatar
                    name={user.username}
                    bgColor={user.avatarColor}
                    textColor="#ffffff"
                    size={48}
                    avatarSrc={user.profilePicture}
                  />
                  <span className="text-[#e4e6eb] font-semibold text-[15px] group-hover:text-white">
                    {user.username}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default UsersModal;
