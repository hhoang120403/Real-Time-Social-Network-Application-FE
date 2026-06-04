import PostForm from '@components/posts/post-form/PostForm';
import PostFormSkeleton from '@components/posts/post-form/PostFormSkeleton';
import Post from '@components/posts/post/Post';
import PostSkeleton from '@components/posts/post/PostSkeleton';
import CountContainer from '@components/timeline/CountContainer';
import useEffectOnce from '@hooks/useEffectOnce';
import { followerService } from '@services/api/followers/follower.service';
import { PostUtils } from '@services/utils/post-utils.service';
import { Utils } from '@services/utils/utils.service';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import '@components/timeline/Timeline.scss';
import BasicInfo from '@components/timeline/BasicInfo';
import SocialLinks from '@components/timeline/SocialLinks';
import useLocalStorage from '@hooks/useLocalStorage';
import { postService } from '@services/api/post/post.service';
import { userService } from '@services/api/user/user.service';
import { addReactions } from '@redux/reducers/post/user-post-reaction.reducer';
import type { RootState } from '@redux/store';

interface ITimelineProps {
  userProfileData: any;
  loading: boolean;
}

const Timeline = ({ userProfileData, loading }: ITimelineProps) => {
  const { profile } = useSelector((state: RootState) => state.user);
  const [posts, setPosts] = useState<any[]>([]);
  const [user, setUser] = useState<any>();
  const [following, setFollowing] = useState<any[]>([]);
  const [editableInputs, setEditableInputs] = useState({
    quote: '',
    work: '',
    school: '',
    location: ''
  });
  const [editableSocialInputs, setEditableSocialInputs] = useState({
    instagram: '',
    twitter: '',
    facebook: '',
    youtube: ''
  });
  const { username } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const storedUsername = useLocalStorage('username', 'get');
  const timelineOwnerId = userProfileData?.user?._id;

  const getTimelineOwnerPosts = useCallback(
    (nextPosts: any[] = []) => {
      if (!timelineOwnerId) {
        return nextPosts;
      }

      return nextPosts.filter((post) => String(post?.userId) === String(timelineOwnerId));
    },
    [timelineOwnerId]
  );

  const setTimelinePosts: React.Dispatch<React.SetStateAction<any[]>> = useCallback(
    (value) => {
      setPosts((prevPosts) => {
        const nextPosts = typeof value === 'function' ? value(prevPosts) : value;
        return getTimelineOwnerPosts(nextPosts);
      });
    },
    [getTimelineOwnerPosts]
  );

  const getUserFollowing = async () => {
    try {
      const response = await followerService.getUserFollowing();
      setFollowing(response.data.following);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const refreshTimelinePosts = useCallback(async () => {
    if (!username || !searchParams.get('id') || !searchParams.get('uId')) return;

    try {
      const response = await userService.getUserProfileByUsername(
        username,
        searchParams.get('id') || '',
        searchParams.get('uId') || ''
      );
      setTimelinePosts(response.data.posts || []);
    } catch (error: any) {
      if (!Utils.shouldSkipErrorNotification(error)) {
        Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
      }
    }
  }, [dispatch, searchParams, setTimelinePosts, username]);

  useEffect(() => {
    if (userProfileData) {
      setPosts(getTimelineOwnerPosts(userProfileData.posts));
    }
  }, [getTimelineOwnerPosts, userProfileData]);

  useEffect(() => {
    if (userProfileData) {
      setUser(userProfileData.user);
      setEditableInputs({
        quote: userProfileData.user.quote,
        work: userProfileData.user.work,
        school: userProfileData.user.school,
        location: userProfileData.user.location
      });
      setEditableSocialInputs(userProfileData.user?.social);
    }
  }, [userProfileData?.user]);

  const getReactionsByUsername = async () => {
    try {
      const reactionsResponse = await postService.getReactionsByUsername(storedUsername);
      dispatch(addReactions(reactionsResponse.data.reactions));
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  useEffectOnce(() => {
    getUserFollowing();
    getReactionsByUsername();
  });

  useEffect(() => {
    if (username !== profile?.username) {
      const firstPost = document.querySelectorAll<HTMLElement>('.post-body')[0];

      if (firstPost) {
        firstPost.style.marginTop = '0';
      }
    }
  }, [username, profile]);

  useEffect(() => {
    if (username === profile?.username && profile) {
      setEditableInputs({
        quote: profile.quote,
        work: profile.work,
        school: profile.school,
        location: profile.location
      });
      setEditableSocialInputs(profile.social);
    }
  }, [profile, username]);

  useEffect(() => {
    PostUtils.socketIOPost(setTimelinePosts);
  }, [setTimelinePosts]);

  useEffect(() => {
    const handlePostCreated = (event: Event) => {
      const post = (event as CustomEvent).detail;
      if (!post?._id) return;

      setTimelinePosts((prevPosts) => {
        const alreadyExists = prevPosts.some((prevPost) => String(prevPost?._id) === String(post._id));
        return alreadyExists ? prevPosts : [post, ...prevPosts];
      });
    };

    window.addEventListener('chatty:post-created', handlePostCreated);
    return () => window.removeEventListener('chatty:post-created', handlePostCreated);
  }, [setTimelinePosts]);

  useEffect(() => {
    const handleTimelineRefresh = () => {
      window.setTimeout(refreshTimelinePosts, 700);
      window.setTimeout(refreshTimelinePosts, 1800);
    };

    window.addEventListener('chatty:timeline-refresh', handleTimelineRefresh);
    return () => window.removeEventListener('chatty:timeline-refresh', handleTimelineRefresh);
  }, [refreshTimelinePosts]);

  useEffect(() => {
    const handlePostUpdated = (event: Event) => {
      const post = (event as CustomEvent).detail;
      if (!post?._id) return;

      setTimelinePosts((prevPosts) =>
        prevPosts.map((prevPost) => (String(prevPost?._id) === String(post._id) ? post : prevPost))
      );
    };

    window.addEventListener('chatty:post-updated', handlePostUpdated);
    return () => window.removeEventListener('chatty:post-updated', handlePostUpdated);
  }, [setTimelinePosts]);

  return (
    <div className="timeline-wrapper" data-testid="timeline">
      <div className="timeline-wrapper-container">
        <div className="timeline-wrapper-container-side">
          <div className="timeline-wrapper-container-side-count">
            <CountContainer
              followersCount={user?.followersCount || 0}
              followingCount={user?.followingCount || 0}
              loading={loading}
            />
          </div>
          <div className="side-content">
            <BasicInfo
              setEditableInputs={setEditableInputs}
              editableInputs={editableInputs}
              username={username!}
              profile={profile}
              loading={loading}
            />
          </div>
          <div className="side-content social">
            <SocialLinks
              setEditableSocialInputs={setEditableSocialInputs}
              editableSocialInputs={editableSocialInputs}
              username={username!}
              profile={profile}
              loading={loading}
            />
          </div>
        </div>
        {loading && !posts.length && (
          <div className="timeline-wrapper-container-main">
            <div style={{ marginBottom: '10px' }}>
              <PostFormSkeleton />
            </div>
            <>
              {[1, 2, 3, 4, 5].map((index) => (
                <div key={index}>
                  <PostSkeleton />
                </div>
              ))}
            </>
          </div>
        )}
        {!loading && posts.length > 0 && (
          <div className="timeline-wrapper-container-main">
            {username === profile?.username && <PostForm />}
            {posts.map((post) => (
              <div key={post?._id}>
                {(!Utils.checkIfUserIsBlocked(profile?.blockedBy!, post?.userId) || post?.userId === profile?._id) && (
                  <>
                    {PostUtils.checkPrivacy(post, profile, following) && (
                      <>
                        <Post
                          post={{
                            ...post,
                            profilePicture:
                              post?.userId === userProfileData?.user?._id
                                ? userProfileData?.user?.profilePicture
                                : post?.profilePicture,
                            avatarColor:
                              post?.userId === userProfileData?.user?._id
                                ? userProfileData?.user?.avatarColor
                                : post?.avatarColor
                          }}
                          showIcons={username === profile?.username}
                          setPosts={setTimelinePosts}
                        />
                      </>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        {!loading && posts.length === 0 && (
          <div className="timeline-wrapper-container-main">
            {username === profile?.username && <PostForm />}
            {/* <div className="empty-page" data-testid="empty-page">
              No post available
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
