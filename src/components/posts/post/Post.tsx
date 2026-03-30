import Avatar from '@components/avatar/Avatar';
import { feelingsList, privacyList } from '@services/utils/static.data';
import { timeAgo } from '@services/utils/timeago.utils';
import { find } from 'lodash';
import { FaPencilAlt, FaRegTrashAlt } from 'react-icons/fa';
import './Post.scss';
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
import { openModal, toggleDeleteDialog } from '@redux/reducers/modal/modal.reducer';
import { clearPost, updatePostItem } from '@redux/reducers/post/post.reducer';
import Dialog from '@components/dialog/Dialog';
import { postService } from '@services/api/post/post.service';
import { ImageUtils } from '@services/utils/image-utils.service';

interface PostProps {
  post: PostItem;
  showIcons: boolean;
}

const Post = ({ post, showIcons }: PostProps) => {
  const { _id } = useSelector((state: RootState) => state.post);
  const { reactionsModalIsOpen, commentsModalIsOpen, deleteDialogIsOpen } = useSelector(
    (state: RootState) => state.modal
  );
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [backgroundImageColor, setBackgroundImageColor] = useState<string>('');
  const selectedPostId = useLocalStorage('selectedPostId', 'get');
  const dispatch = useDispatch<AppDispatch>();

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
      const response = await postService.deletePost(_id);
      if (response) {
        Utils.dispatchNotification(response.data.message, 'success', dispatch);
        dispatch(toggleDeleteDialog({ toggle: !deleteDialogIsOpen }));
        dispatch(clearPost());
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
    dispatch(toggleDeleteDialog({ toggle: !deleteDialogIsOpen }));
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
      {commentsModalIsOpen && <CommentsModal />}
      {showImageModal && (
        <ImageModal image={imageUrl} onCancel={() => setShowImageModal(!showImageModal)} showArrow={false} />
      )}
      {deleteDialogIsOpen && (
        <Dialog
          title="Are you sure you want to delete this post?"
          firstButtonText="Delete"
          secondButtonText="Cancel"
          firstBtnHandler={deletePost}
          secondBtnHandler={() => {
            dispatch(toggleDeleteDialog({ toggle: !deleteDialogIsOpen }));
            dispatch(clearPost());
          }}
        />
      )}
      <div className="post-body" data-testid="post">
        <div className="user-post-data">
          <div className="user-post-data-wrap">
            <div className="user-post-image">
              <Avatar
                name={post?.username}
                bgColor={post?.avatarColor}
                textColor="#ffffff"
                size={50}
                avatarSrc={post?.profilePicture}
              />
            </div>
            <div className="user-post-info">
              <div className="inline-title-display">
                <h5 data-testid="username">
                  {post?.username}
                  {post?.feelings && (
                    <div className="inline-display" data-testid="inline-display">
                      is feeling <img className="feeling-icon" src={getFeeling(post?.feelings!)} alt="" />{' '}
                      <div>{post?.feelings}</div>
                    </div>
                  )}
                </h5>
                {showIcons && (
                  <div className="post-icons" data-testid="post-icons">
                    <FaPencilAlt className="pencil" onClick={openPostModal} />
                    <FaRegTrashAlt className="trash" onClick={openDeleteDialog} />
                  </div>
                )}
              </div>

              {post?.createdAt && (
                <p className="time-text-display" data-testid="time-display">
                  {timeAgo.transform(post?.createdAt)} &middot; {getPrivacy(post?.privacy)}
                </p>
              )}
            </div>
            <hr />
            <div className="user-post" style={{ marginTop: '1rem', borderBottom: '' }}>
              {post?.post && post?.bgColor === '#ffffff' && (
                <p className="post" data-testid="user-post">
                  {post?.post}
                </p>
              )}
              {post?.post && post?.bgColor !== '#ffffff' && (
                <div
                  data-testid="user-post-with-bg"
                  className="user-post-with-bg"
                  style={{ backgroundColor: `${post?.bgColor}` }}
                >
                  {post?.post}
                </div>
              )}

              {post?.imgId && !post?.gifUrl && post.bgColor === '#ffffff' && (
                <div
                  data-testid="post-image"
                  className="image-display-flex"
                  style={{ height: '600px', backgroundColor: backgroundImageColor }}
                  onClick={() => {
                    setImageUrl(Utils.getImage(post?.imgId!, post?.imgVersion!));
                    setShowImageModal(!showImageModal);
                  }}
                >
                  <img
                    className="post-image"
                    style={{ objectFit: 'contain' }}
                    src={`${Utils.getImage(post?.imgId!, post?.imgVersion!)}`}
                    alt="Post visual"
                  />
                </div>
              )}

              {post?.gifUrl && post.bgColor === '#ffffff' && (
                <div
                  className="image-display-flex"
                  style={{ height: '600px', backgroundColor: backgroundImageColor }}
                  onClick={() => {
                    setImageUrl(post?.gifUrl!);
                    setShowImageModal(!showImageModal);
                  }}
                >
                  <img className="post-image" style={{ objectFit: 'contain' }} src={`${post?.gifUrl}`} alt="" />
                </div>
              )}
              {(post?.reactions.like > 0 ||
                post?.reactions.love > 0 ||
                post?.reactions.wow > 0 ||
                post?.reactions.sad > 0 ||
                post?.reactions.happy > 0 ||
                post?.reactions.angry > 0 ||
                Number(post?.commentsCount) > 0) && <hr />}
              <PostCommentSection post={post} />
            </div>
          </div>

          {selectedPostId === post._id && <CommentInputBox post={post} />}
        </div>
      </div>
    </>
  );
};

export default Post;
