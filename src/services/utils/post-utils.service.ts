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
  static selectBackground(
    bgColor: string,
    postData: PostData,
    setTextAreaBackground: (value: string) => void,
    setPostData: (value: any) => void
  ) {
    postData.bgColor = bgColor;
    setTextAreaBackground(bgColor);
    setPostData(postData);
  }

  static postInputEditable(textContent: string, postData: PostData, setPostData: (value: PostData) => void) {
    postData.post = textContent;
    setPostData(postData);
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
    setPostData: (value: PostData) => void
  ) {
    postData.gifUrl = '';
    postData.image = '';
    setSelectedPostImage(null);
    setPostImage('');
    setTimeout(() => {
      if (inputRef?.current) {
        inputRef.current.textContent = !post ? postData?.post : post;
        if (post) {
          postData.post = post;
        }
        setPostData(postData);
      }
      PostUtils.positionCursor('editable');
    });
    dispatch(updatePostItem({ gifUrl: '', image: '', imgId: '', imgVersion: '' }));
  }

  static postInputData(
    imageInputRef: React.RefObject<HTMLDivElement | null>,
    postData: PostData,
    post: string,
    setPostData: (value: PostData) => void
  ) {
    setTimeout(() => {
      if (imageInputRef?.current) {
        imageInputRef.current.textContent = !post ? postData?.post : post;
        if (post) {
          postData.post = post;
        }
        setPostData(postData);
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

  static socketIOPost(posts: PostItem[], setPosts: (posts: PostItem[]) => void) {
    posts = cloneDeep(posts);
    socketService?.socket?.on('add post', (post: PostItem) => {
      posts = [post, ...posts];
      setPosts(posts);
    });

    socketService?.socket?.on('update post', (post: PostItem) => {
      PostUtils.updateSinglePost(posts, post, setPosts);
    });

    socketService?.socket?.on('delete post', (postId: string) => {
      const index = findIndex(posts, (postData) => postData._id === postId);
      if (index > -1) {
        posts = cloneDeep(posts);
        remove(posts, { _id: postId });
        setPosts(posts);
      }
    });

    socketService?.socket?.on('update like', (reactionData: any) => {
      const postData = find(posts, (post) => post._id === reactionData?.postId);
      if (postData) {
        postData.reactions = reactionData.postReactions;
        PostUtils.updateSinglePost(posts, postData, setPosts);
      }
    });

    socketService?.socket?.on('update comment', (commentData: any) => {
      const postData = find(posts, (post) => post._id === commentData?.postId);
      if (postData) {
        postData.commentsCount = commentData.commentsCount;
        PostUtils.updateSinglePost(posts, postData, setPosts);
      }
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
