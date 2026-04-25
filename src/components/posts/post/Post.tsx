import Avatar from '@components/avatar/Avatar';
import { feelingsList, privacyList } from '@services/utils/static.data';
import { timeAgo } from '@services/utils/timeago.utils';
import { find } from 'lodash';
import { FaPencilAlt, FaRegTrashAlt, FaEllipsisH } from 'react-icons/fa';
import PostCommentSection from '../post-comment-section/PostCommentSection';
import { Utils } from '@services/utils/utils.service';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@redux/store';
import ReactionsModal from '../reactions/reactions-modal/ReactionsModal';
import type { PostItem } from '@app-types/post';
import useLocalStorage from '@hooks/useLocalStorage';
import CommentInputBox from '../comments/comment-input/CommentInputBox';
import CommentsModal from '../comments/comments-modal/CommentsModal';
import { useEffect, useState } from 'react';
import ImageModal from '@components/image-modal/ImageModal';
import { openModal, toggleDeletePostDialog } from '@redux/reducers/modal/modal.reducer';
import { clearPost, updatePostItem } from '@redux/reducers/post/post.reducer';
import { ImageUtils } from '@services/utils/image-utils.service';
import { useNavigate } from 'react-router-dom';
import { ProfileUtils } from '@services/utils/profile-utils.service';
import { postService } from '@services/api/post/post.service';
import Dialog from '@components/dialog/Dialog';

interface PostProps {
  post: PostItem;
  showIcons: boolean;
  setPosts?: React.Dispatch<React.SetStateAction<any[]>>;
}

const Post = ({ post, showIcons, setPosts }: PostProps) => {
  const { profile } = useSelector((state: RootState) => state.user);
  const { reactionsModalIsOpen, commentsModalIsOpen, deletePostDialogIsOpen, data } = useSelector(
    (state: RootState) => state.modal
  );
  const selectedPost = useSelector((state: RootState) => state.post);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [showActionDropdown, setShowActionDropdown] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [backgroundImageColor, setBackgroundImageColor] = useState<string>('');
  const selectedPostId = useLocalStorage('selectedPostId', 'get');
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const getFeeling = (name: string) => {
    const feeling = find(feelingsList, (data) => data.name === name);
    return feeling?.image;
  };

  const getPrivacy = (type: string) => {
    const privacy = find(privacyList, (data) => data.topText === type);
    return privacy?.icon;
  };

  const deletePost = async () => {
    try {
      const response = await postService.deletePost(post._id);
      if (response) {
        Utils.dispatchNotification(response.data.message, 'success', dispatch);
        dispatch(toggleDeletePostDialog({ toggle: false, data: null }));
        dispatch(clearPost());
        if (setPosts) {
          setPosts((prevPosts: any[]) => prevPosts.filter((item) => item._id !== post._id));
        }
      }
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const openPostModal = () => {
    dispatch(openModal({ type: 'edit' }));
    dispatch(updatePostItem(post));
  };

  const openDeleteDialog = () => {
    dispatch(toggleDeletePostDialog({ toggle: true, data: post._id }));
    dispatch(updatePostItem(post));
  };

  const getBackgroundImageColor = async (post: any) => {
    let imageUrl = '';
    if (post?.imgId && !post?.gifUrl && post.bgColor === '#ffffff') {
      imageUrl = Utils.getImage(post?.imgId, post?.imgVersion);
    } else if (post?.gifUrl && post.bgColor === '#ffffff') {
      imageUrl = post?.gifUrl;
    }

    const bgColor = await ImageUtils.getBackgroundImageColor(imageUrl);
    setBackgroundImageColor(bgColor as string);
  };

  useEffect(() => {
    getBackgroundImageColor(post);
  }, [post]);

  return (
    <>
      {reactionsModalIsOpen && <ReactionsModal />}
      {commentsModalIsOpen && selectedPost?._id === post?._id && <CommentsModal />}
      {showImageModal && (
        <ImageModal image={imageUrl} onCancel={() => setShowImageModal(!showImageModal)} showArrow={false} />
      )}
      {deletePostDialogIsOpen && data && data === post?._id && (
        <Dialog
          title="Are you sure you want to delete this post?"
          subTitle="Do you really want to delete this item? You won’t be able to recover it."
          showButtons={true}
          firstButtonText="Delete"
          secondButtonText="Cancel"
          firstBtnHandler={deletePost}
          secondBtnHandler={() => {
            dispatch(toggleDeletePostDialog({ toggle: false, data: null }));
            dispatch(clearPost());
          }}
        />
      )}
      <div className="p-4 mt-4 mb-6 bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)]" data-testid="post">
        <div className="flex flex-col w-full">
          {/* Header Section */}
          <div className="flex gap-3 items-start w-full mb-3">
            <div
              className="shrink-0 cursor-pointer"
              onClick={() =>
                ProfileUtils.navigateToProfile(
                  { _id: post?.userId, uId: (post as any)?.uId, username: post?.username } as any,
                  navigate
                )
              }
            >
              <Avatar
                name={post?.username}
                bgColor={profile?.username === post?.username ? profile?.avatarColor : post?.avatarColor}
                textColor="#ffffff"
                size={50}
                avatarSrc={profile?.username === post?.username ? profile?.profilePicture : post?.profilePicture}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 min-w-0">
                  <h5
                    data-testid="username"
                    className="text-[15px] font-bold text-[#050505] hover:underline cursor-pointer leading-none"
                    onClick={() =>
                      ProfileUtils.navigateToProfile(
                        { _id: post?.userId, uId: (post as any)?.uId, username: post?.username } as any,
                        navigate
                      )
                    }
                  >
                    {post?.username}
                  </h5>
                  {post?.feelings && (
                    <div
                      className="flex items-center gap-1 text-[15px] text-[#65676b] leading-none"
                      data-testid="inline-display"
                    >
                      <span>is feeling</span>
                      <img className="w-7 h-7 object-contain" src={getFeeling(post?.feelings!)} alt="" />
                      <span className="font-bold text-[#050505]">{post?.feelings}</span>
                    </div>
                  )}
                </div>

                {showIcons && (
                  <div className="relative shrink-0" data-testid="post-icons">
                    <div
                      className="w-8 h-8 rounded-full hover:bg-[#f0f2f5] flex items-center justify-center cursor-pointer transition-colors"
                      onClick={() => setShowActionDropdown(!showActionDropdown)}
                    >
                      <FaEllipsisH className="text-[#65676b]" />
                    </div>

                    {showActionDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowActionDropdown(false)}></div>
                        <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.2)] border border-[#f0f2f5] z-50 overflow-hidden py-2 p-1">
                          <div
                            className="flex items-center gap-3 px-3 py-2 hover:bg-[#f0f2f5] rounded-md mx-1 cursor-pointer transition-colors"
                            onClick={() => {
                              setShowActionDropdown(false);
                              openPostModal();
                            }}
                          >
                            <FaPencilAlt className="text-[#050505]" />
                            <span className="text-[15px] font-medium text-[#050505]">Edit Post</span>
                          </div>
                          <div
                            className="flex items-center gap-3 px-3 py-2 hover:bg-[#f0f2f5] rounded-md mx-1 cursor-pointer transition-colors"
                            onClick={() => {
                              setShowActionDropdown(false);
                              openDeleteDialog();
                            }}
                          >
                            <FaRegTrashAlt className="text-[#050505]" />
                            <span className="text-[15px] font-medium text-[#050505]">Delete Post</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {post?.createdAt && (
                <div className="flex items-center gap-1 text-[13px] text-[#65676b] mt-0.5" data-testid="time-display">
                  <span>{timeAgo.transform(post?.createdAt)}</span>
                  <span>&middot;</span>
                  <div className="flex items-center">{getPrivacy(post?.privacy)}</div>
                </div>
              )}
            </div>
          </div>

          <div className="w-full">
            {/* Post Text Content */}
            {post?.post && post?.bgColor === '#ffffff' && (
              <p
                className="text-[#050505] text-[15px] whitespace-pre-wrap wrap-break-word mb-3"
                data-testid="user-post"
              >
                {post?.post}
              </p>
            )}

            {/* Post with Background Color */}
            {post?.post && post?.bgColor !== '#ffffff' && (
              <div
                data-testid="user-post-with-bg"
                className="w-full min-h-[300px] flex items-center justify-center text-center p-8 text-white text-[28px] font-bold rounded-xl mb-3 overflow-y-auto break-all"
                style={{ backgroundColor: `${post?.bgColor}` }}
              >
                {post?.post}
              </div>
            )}

            {/* Post Image Content */}
            {post?.imgId && !post?.gifUrl && post.bgColor === '#ffffff' && (
              <div
                data-testid="post-image"
                className="flex items-center justify-center w-full min-h-[300px] max-h-[600px] rounded-lg overflow-hidden cursor-pointer mb-3"
                style={{ backgroundColor: backgroundImageColor }}
                onClick={() => {
                  setImageUrl(Utils.getImage(post?.imgId!, post?.imgVersion!));
                  setShowImageModal(!showImageModal);
                }}
              >
                <img
                  className="max-w-full max-h-[600px] object-contain"
                  src={`${Utils.getImage(post?.imgId!, post?.imgVersion!)}`}
                  alt="Post visual"
                />
              </div>
            )}

            {/* Post GIF Content */}
            {post?.gifUrl && post.bgColor === '#ffffff' && (
              <div
                className="flex items-center justify-center w-full min-h-[300px] max-h-[600px] rounded-lg overflow-hidden cursor-pointer mb-3"
                style={{ backgroundColor: backgroundImageColor }}
                onClick={() => {
                  setImageUrl(post?.gifUrl!);
                  setShowImageModal(!showImageModal);
                }}
              >
                <img className="max-w-full max-h-[600px] object-contain" src={`${post?.gifUrl}`} alt="" />
              </div>
            )}

            {/* Post Video Content */}
            {post?.videoId && post.bgColor === '#ffffff' && (
              <div
                data-testid="post-video"
                className="flex items-center justify-center w-full min-h-[300px] max-h-[600px] rounded-lg overflow-hidden mb-3 bg-black"
              >
                <video
                  className="max-w-full max-h-[600px]"
                  src={`${Utils.getVideo(post?.videoId!, post?.videoVersion!)}`}
                  controls
                />
              </div>
            )}

            {/* Reactions & Comments Area Overlay Line */}
            {(post?.reactions?.like! > 0 ||
              post?.reactions?.love! > 0 ||
              post?.reactions?.wow! > 0 ||
              post?.reactions?.sad! > 0 ||
              post?.reactions?.happy! > 0 ||
              post?.reactions?.angry! > 0 ||
              Number(post?.commentsCount) > 0) && <div className="h-[0.5px] bg-[#e4e6eb] w-full my-2"></div>}

            <PostCommentSection post={post} setPosts={setPosts} />
          </div>

          {selectedPostId === post._id && (
            <div className="mt-2 border-t border-[#f0f2f5] pt-3">
              <CommentInputBox post={post} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Post;
