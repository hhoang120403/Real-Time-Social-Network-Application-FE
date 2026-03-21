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

const Streams = () => {
  const { allPosts } = useSelector((state: RootState) => state);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPostsCount, setTotalPostsCount] = useState<number>(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const bottomLineRef = useRef<HTMLDivElement>(null);
  const appPosts = useRef<any[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const storedUsername = useLocalStorage('username', 'get');
  const [deleteSelectedPostId] = useLocalStorage('selectedPostId', 'delete');

  useInfiniteScroll(bodyRef, bottomLineRef, fetchPostData);
  const PAGE_SIZE = 10;

  function fetchPostData() {
    let pageNum = currentPage;
    if (currentPage <= Math.round(totalPostsCount / PAGE_SIZE)) {
      pageNum += 1;
      setCurrentPage(pageNum);
      getAllPosts(pageNum);
    }
  }

  const getAllPosts = async (page = currentPage) => {
    setLoading(true);
    try {
      const response = await postService.getAllPosts(page);
      if (response.data.posts.length > 0) {
        appPosts.current = [...posts, ...response.data.posts];
        const allPosts = uniqBy(appPosts.current, '_id');
        setPosts(allPosts);
      }
      setLoading(false);
    } catch (error: any) {
      Utils.dispatchNotification(error.response.data.message, 'error', dispatch);
      setLoading(false);
    }
  };

  const getReactionsByUsername = async () => {
    try {
      const response = await postService.getReactionsByUsername(storedUsername);
      dispatch(addReactions(response.data.reactions));
    } catch (error: any) {
      Utils.dispatchNotification(error.response.data.message, 'error', dispatch);
    }
  };

  useEffectOnce(() => {
    // getAllPosts();
    getReactionsByUsername();
    deleteSelectedPostId();
  });

  useEffect(() => {
    dispatch(getPosts());
    dispatch(getUserSuggestions());
  }, [dispatch]);

  useEffect(() => {
    setLoading(allPosts?.isLoading);
    setPosts(allPosts?.posts);
    setTotalPostsCount(allPosts?.totalPostsCount);
  }, [allPosts]);

  useEffect(() => {
    PostUtils.socketIOPost(posts, setPosts);
  }, [posts]);

  return (
    <div className="streams">
      <div className="streams-content">
        <div className="streams-post" ref={bodyRef}>
          <PostForm />
          <Posts allPosts={posts} userFollowing={[]} postsLoading={loading} />
          <div style={{ marginBottom: '50px', height: '50px' }} ref={bottomLineRef}></div>
        </div>
        <div className="streams-suggestions">
          <Suggestions />
        </div>
      </div>
    </div>
  );
};

export default Streams;
