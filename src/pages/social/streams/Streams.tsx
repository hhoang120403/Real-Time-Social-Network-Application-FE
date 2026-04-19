import '@pages/social/streams/Streams.scss';
import { useEffect, useRef, useState } from 'react';
import Suggestions from '@components/suggestions/Suggestions';
import { useDispatch } from 'react-redux';
import { getUserSuggestions } from '@redux/api/suggestion';
import type { AppDispatch } from '@redux/store';
import useEffectOnce from '@hooks/useEffectOnce';
import PostForm from '@components/posts/post-form/PostForm';
import Posts from '@components/posts/Posts';
import { Utils } from '@services/utils/utils.service';
import { postService } from '@services/api/post/post.service';
import { getPosts } from '@redux/api/posts';
import { useSelector } from 'react-redux';
import type { RootState } from '@redux/store';
import { uniqBy } from 'lodash';
import useInfiniteScroll from '@hooks/useInfiniteScroll';
import { PostUtils } from '@services/utils/post-utils.service';
import useLocalStorage from '@hooks/useLocalStorage';
import { addReactions } from '@redux/reducers/post/user-post-reaction.reducer';
import { followerService } from '@services/api/followers/follower.service';

const Streams = () => {
  const { allPosts } = useSelector((state: RootState) => state);
  const [posts, setPosts] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPostsCount, setTotalPostsCount] = useState<number>(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const bottomLineRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const storedUsername = useLocalStorage('username', 'get');
  const [deleteSelectedPostId] = useLocalStorage('selectedPostId', 'delete');

  const getAllPosts = async (page = currentPage) => {
    setLoading(true);
    try {
      const response = await postService.getAllPosts(page);
      if (response.data.posts.length > 0) {
        setPosts((prevPosts) => {
          const combined = [...prevPosts, ...response.data.posts];
          return uniqBy(combined, '_id');
        });
        if (response.data.totalPosts) {
          setTotalPostsCount(response.data.totalPosts);
        }
      }
      setLoading(false);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message || 'Error fetching posts', 'error', dispatch);
      setLoading(false);
    }
  };

  const fetchPostData = () => {
    if (loading || posts.length >= totalPostsCount) return;
    const pageNum = currentPage + 1;
    setCurrentPage(pageNum);
    getAllPosts(pageNum);
  };

  useInfiniteScroll(bottomLineRef, fetchPostData);

  const getReactionsByUsername = async () => {
    try {
      const response = await postService.getReactionsByUsername(storedUsername);
      dispatch(addReactions(response.data.reactions));
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const getUserFollowing = async () => {
    try {
      const response = await followerService.getUserFollowing();
      setFollowing(response.data.following);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  useEffectOnce(() => {
    getUserFollowing();
    getReactionsByUsername();
    deleteSelectedPostId();
    dispatch(getPosts());
    dispatch(getUserSuggestions());
  });

  useEffect(() => {
    if (allPosts?.posts) {
      setPosts(allPosts.posts);
      setTotalPostsCount(allPosts.totalPostsCount);
    }
  }, [allPosts.posts, allPosts.totalPostsCount]);

  useEffect(() => {
    setLoading(allPosts.isLoading);
  }, [allPosts.isLoading]);

  useEffect(() => {
    PostUtils.socketIOPost(setPosts);
  }, [setPosts]);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-0 sm:px-4">
      <div className="flex flex-col lg:flex-row gap-8 justify-center items-start">
        {/* Main Feed Section */}
        <div className="flex-1 max-w-[680px] w-full min-w-0" ref={bodyRef}>
          <div className="flex flex-col">
            <PostForm />
            <Posts allPosts={posts} userFollowing={following} postsLoading={loading} />
            <div className="h-20" ref={bottomLineRef}></div>
          </div>
        </div>

        {/* Suggestions Sidebar */}
        <div className="hidden lg:block w-[350px] shrink-0 sticky h-fit">
          <Suggestions />
        </div>
      </div>
    </div>
  );
};

export default Streams;
