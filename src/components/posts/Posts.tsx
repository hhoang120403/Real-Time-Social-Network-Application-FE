import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@redux/store';
import { Utils } from '@services/utils/utils.service';
import './Posts.scss';
import type { PostItem } from '@app-types/post';
import Post from './post/Post';
import { PostUtils } from '@services/utils/post-utils.service';
import PostSkeleton from './post/PostSkeleton';

interface PostsProps {
  allPosts: PostItem[];
  userFollowing: any[];
  postsLoading: boolean;
}

const Posts = ({ allPosts, userFollowing, postsLoading }: PostsProps) => {
  const { profile } = useSelector((state: RootState) => state.user);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setPosts(allPosts);
    setFollowing(userFollowing);
    setLoading(postsLoading);
  }, [allPosts, userFollowing, postsLoading]);

  return (
    <div className="posts-container">
      {posts.length > 0 &&
        posts.map((post) => (
          <div key={post?._id}>
            {(!Utils.checkIfUserIsBlocked(profile?.blockedBy || [], post?.userId) || post?.userId === profile?._id) && (
              <>{PostUtils.checkPrivacy(post, profile, following) && <Post post={post} showIcons={false} />}</>
            )}
          </div>
        ))}

      {loading &&
        !posts.length &&
        [1, 2, 3, 4, 5, 6].map((index) => (
          <div key={index}>
            <PostSkeleton />
          </div>
        ))}
    </div>
  );
};

export default Posts;
