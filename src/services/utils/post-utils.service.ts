import type { PostData, PostItem } from '@app-types/post';
import { closeModal } from '@redux/reducers/modal/modal.reducer';
import { clearPost, updatePostItem } from '@redux/reducers/post/post.reducer';
import type { Dispatch } from '@reduxjs/toolkit';
import { postService } from '@services/api/post/post.service';
import { Utils } from './utils.service';
import type { NotificationType } from '@app-types/toast';
import { cloneDeep, find, findIndex, remove } from 'lodash';
import { socketService } from '@services/socket/socket.service';

export class PostUtils {
  static notifyPostUpdated(post: PostItem | undefined) {
    if (!post?._id) return;
    window.dispatchEvent(new CustomEvent('chatty:post-updated', { detail: post }));
  }

  static selectBackground(
    bgColor: string,
    setTextAreaBackground: (value: string) => void,
    setPostData: (value: any) => void
  ) {
    setTextAreaBackground(bgColor);
    setPostData((prev: any) => ({ ...prev, bgColor }));
  }

  static postInputEditable(textContent: string, postData: PostData, setPostData: (value: PostData) => void) {
    setPostData({ ...postData, post: textContent });
  }

  static closePostModal(dispatch: Dispatch) {
    dispatch(closeModal());
    dispatch(clearPost());
  }

  static clearImage(
    postData: PostData,
    post: string,
    inputRef: React.RefObject<HTMLDivElement | null>,
    dispatch: Dispatch,
    setSelectedPostImage: (value: File | null) => void,
    setPostImage: (value: string) => void,
    setPostData: (value: any) => void
  ) {
    setSelectedPostImage(null);
    setPostImage('');
    setPostData((prev: any) => ({ ...prev, gifUrl: '', image: '', video: '', post: post || prev.post }));
    setTimeout(() => {
      if (inputRef?.current) {
        inputRef.current.textContent = post || postData?.post;
      }
      PostUtils.positionCursor('editable');
    });
    dispatch(updatePostItem({ gifUrl: '', image: '', video: '', imgId: '', imgVersion: '', videoId: '', videoVersion: '' }));
  }

  static postInputData(
    imageInputRef: React.RefObject<HTMLDivElement | null>,
    postData: PostData,
    post: string,
    setPostData: (value: any) => void
  ) {
    setTimeout(() => {
      if (imageInputRef?.current) {
        imageInputRef.current.textContent = post || postData?.post || '';
        setPostData((prev: any) => ({ ...prev, post: post || prev.post || '' }));
        PostUtils.positionCursor('editable');
      }
    });
  }

  static dispatchNotification(
    message: string,
    type: NotificationType,
    setApiResponse: (value: string) => void,
    setLoading: (value: boolean) => void,
    dispatch: Dispatch
  ) {
    setApiResponse(type);
    setLoading(false);
    Utils.dispatchNotification(message, type, dispatch);
  }

  static async sendPostWithImageRequest(
    fileResult: string,
    postData: PostData,
    imageInputRef: React.RefObject<HTMLDivElement | null>,
    setApiResponse: (value: string) => void,
    setLoading: (value: boolean) => void,
    dispatch: Dispatch
  ) {
    try {
      postData.image = fileResult;
      if (imageInputRef?.current) {
        imageInputRef.current.textContent = postData.post;
      }
      const response = await postService.createPostWithImage(postData);
      if (response) {
        setApiResponse('success');
        setLoading(false);
        return response;
      }
    } catch (error: any) {
      PostUtils.dispatchNotification(error.response.data.message, 'error', setApiResponse, setLoading, dispatch);
    }
  }
  
  static async sendPostWithVideoRequest(
    fileResult: string,
    postData: PostData,
    imageInputRef: React.RefObject<HTMLDivElement | null>,
    setApiResponse: (value: string) => void,
    setLoading: (value: boolean) => void,
    dispatch: Dispatch
  ) {
    try {
      postData.video = fileResult;
      if (imageInputRef?.current) {
        imageInputRef.current.textContent = postData.post;
      }
      const response = await postService.createPostWithVideo(postData);
      if (response) {
        setApiResponse('success');
        setLoading(false);
        return response;
      }
    } catch (error: any) {
      PostUtils.dispatchNotification(error.response.data.message, 'error', setApiResponse, setLoading, dispatch);
    }
  }

  static async sendPostWithFileRequest(
    type: string,
    postData: PostData,
    imageInputRef: React.RefObject<HTMLDivElement | null>,
    setApiResponse: (value: string) => void,
    setLoading: (value: boolean) => void,
    dispatch: Dispatch
  ) {
    try {
      if (imageInputRef?.current) {
        imageInputRef.current.textContent = postData.post;
      }
      const response =
        type === 'image'
          ? await postService.createPostWithImage(postData)
          : await postService.createPostWithVideo(postData);
      if (response) {
        setApiResponse('success');
        setLoading(false);
      }
    } catch (error: any) {
      PostUtils.dispatchNotification(error.response.data.message, 'error', setApiResponse, setLoading, dispatch);
    }
  }

  static async sendUpdatePostWithImageRequest(
    fileResult: string,
    postId: string,
    postData: PostData,
    setApiResponse: (value: string) => void,
    setLoading: (value: boolean) => void,
    dispatch: Dispatch
  ) {
    try {
      postData.image = fileResult;
      postData.gifUrl = '';
      postData.imgId = '';
      postData.imgVersion = '';
      const response = await postService.updatePostWithImage(postId, postData);
      if (response) {
        PostUtils.notifyPostUpdated(response.data.post);
        PostUtils.dispatchNotification(response?.data?.message, 'success', setApiResponse, setLoading, dispatch);
        setTimeout(() => {
          setApiResponse('');
          setLoading(false);
        }, 3000);
        PostUtils.closePostModal(dispatch);
      }
    } catch (error: any) {
      PostUtils.dispatchNotification(error.response?.data?.message, 'error', setApiResponse, setLoading, dispatch);
    }
  }

  static async sendUpdatePostRequest(
    postId: string,
    postData: PostData,
    setApiResponse: (value: string) => void,
    setLoading: (value: boolean) => void,
    dispatch: Dispatch
  ) {
    try {
      const response = await postService.updatePost(postId, postData);
      if (response) {
        PostUtils.notifyPostUpdated(response.data.post);
        PostUtils.dispatchNotification(response?.data?.message, 'success', setApiResponse, setLoading, dispatch);
        setTimeout(() => {
          setApiResponse('success');
          setLoading(false);
        }, 3000);
        PostUtils.closePostModal(dispatch);
      }
    } catch (error: any) {
      PostUtils.dispatchNotification(error.response?.data?.message, 'error', setApiResponse, setLoading, dispatch);
    }
  }

  static checkPrivacy(post: any, profile: any, following: any) {
    const isPrivate = post?.privacy === 'Private' && post?.userId === profile?._id;
    const isPublic = post?.privacy === 'Public';
    const isFollower =
      post?.privacy === 'Followers' && (Utils.checkIfUserIsFollowed(following, post?.userId) || post?.userId === profile?._id);
    return isPrivate || isPublic || isFollower;
  }

  static positionCursor(elementId: string) {
    const element = document.getElementById(`${elementId}`);
    const selection = window.getSelection();
    const range = document.createRange();
    selection?.removeAllRanges();
    range.selectNodeContents(element!);
    range.collapse(false);
    selection?.addRange(range);
    element?.focus();
  }

  static socketIOPost(setPosts: React.Dispatch<React.SetStateAction<PostItem[]>>, dispatch?: any) {
    socketService?.socket?.off('add post');
    socketService?.socket?.on('add post', (post: PostItem) => {
      setPosts((prevPosts) => {
        const alreadyExists = prevPosts.some((prevPost) => String(prevPost?._id) === String(post?._id));
        return alreadyExists ? prevPosts : [post, ...prevPosts];
      });
    });

    socketService?.socket?.off('update post');
    socketService?.socket?.on('update post', (post: PostItem) => {
      setPosts((prevPosts) => {
        const posts = cloneDeep(prevPosts);
        const index = findIndex(posts, (p) => String(p._id) === String(post?._id));
        if (index > -1) {
          posts.splice(index, 1, post);
        }
        return posts;
      });
      if (dispatch) {
        dispatch({ type: 'allPosts/updatePost', payload: post });
      }
    });

    socketService?.socket?.off('delete post');
    socketService?.socket?.on('delete post', (postId: string | string[]) => {
      setPosts((prevPosts) => {
        const posts = cloneDeep(prevPosts);
        const deletedPostIds = Array.isArray(postId) ? postId : [postId];
        remove(posts, (postData) => deletedPostIds.includes(String(postData._id)));
        return posts;
      });
    });

    socketService?.socket?.off('update like');
    socketService?.socket?.on('update like', (reactionData: any) => {
      setPosts((prevPosts) => {
        const posts = cloneDeep(prevPosts);
        const postData = find(posts, (post) => String(post._id) === String(reactionData?.postId));
        if (postData) {
          postData.reactions = reactionData.postReactions;
          const index = findIndex(posts, (p) => String(p._id) === String(postData?._id));
          if (index > -1) {
            posts.splice(index, 1, postData);
          }
        }
        return posts;
      });
    });

    socketService?.socket?.off('update comment');
    socketService?.socket?.on('update comment', (commentData: any) => {
      setPosts((prevPosts) => {
        const posts = cloneDeep(prevPosts);
        const postData = find(posts, (post) => String(post._id) === String(commentData?.postId));
        if (postData) {
          postData.commentsCount = commentData.commentsCount;
          const index = findIndex(posts, (p) => String(p._id) === String(postData?._id));
          if (index > -1) {
            posts.splice(index, 1, postData);
          }
        }
        return posts;
      });
    });
  }

  static updateSinglePost(posts: PostItem[], post: PostItem, setPosts: (posts: PostItem[]) => void) {
    posts = cloneDeep(posts);
    const index = findIndex(posts, ['_id', post?._id]);
    if (index > -1) {
      posts.splice(index, 1, post);
      setPosts(posts);
    }
  }
}
