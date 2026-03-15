import Avatar from '@components/avatar/Avatar';
import Button from '@components/button/Button';
import '@components/suggestions/Suggestions.scss';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@redux/store';
import { useNavigate } from 'react-router-dom';

const Suggestions = () => {
  const { suggestions } = useSelector((state: RootState) => state);
  const [users, setUsers] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setUsers(suggestions?.users);
  }, [suggestions, users]);

  return (
    <div className="suggestions-list-container" data-testid="suggestions-container">
      <div className="suggestions-header">
        <div className="title-text">Suggestions</div>
      </div>
      <hr />
      <div className="suggestions-container">
        <div className="suggestions">
          {users?.map((user, index) => (
            <div data-testid="suggestions-item" className="suggestions-item" key={index}>
              <Avatar
                name={user?.username}
                bgColor={user?.avatarColor}
                textColor="#ffffff"
                size={40}
                avatarSrc={user?.profilePicture}
              />
              <div className="title-text">{user?.username}</div>
              <div className="add-icon">
                <Button label="Follow" className="button follow" disabled={false} />
              </div>
            </div>
          ))}
        </div>
        {users?.length > 10 && (
          <div className="view-more" onClick={() => navigate('/app/social/people')}>
            View More
          </div>
        )}
      </div>
    </div>
  );
};

export default Suggestions;
