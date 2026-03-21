import CommentArea from '@components/posts/comment-area/CommentArea';
import type { PostItem } from '@app-types/post';
import ReactionsAndCommentsDisplay from '../reactions/reactions-and-comments-display/ReactionsAndCommentsDisplay';

interface IPostCommentSectionProps {
  post: PostItem;
}

const PostCommentSection = ({ post }: IPostCommentSectionProps) => {
  return (
    <div data-testid="comment-section">
      <ReactionsAndCommentsDisplay post={post} />
      <CommentArea post={post} />
    </div>
  );
};

export default PostCommentSection;
