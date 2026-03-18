import '@components/posts/modal-wrappers/post-wrapper/PostWrapper.scss';

const PostWrapper = ({ children }: { children: React.ReactNode[] }) => {
  return (
    <div className="modal-wrapper" data-testid="post-modal">
      {children[1]}
      {children[2]}
      {children[3]}
      <div className="modal-bg"></div>
    </div>
  );
};

export default PostWrapper;
