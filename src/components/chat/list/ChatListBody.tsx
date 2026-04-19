import { FaCheck } from 'react-icons/fa';
import doubleCheckmark from '@assets/images/double-checkmark.png';

interface ChatListBodyProps {
  data: any;
  profile: any;
}

const ChatListBody = ({ data, profile }: ChatListBodyProps) => {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="text-[13px] text-gray-500 truncate flex-1 leading-tight">
        {data.senderUsername === profile?.username && <span className="text-gray-400 mr-0.5">You:</span>}
        {data.body}
      </span>
      {!data.isRead ? (
        <div className="shrink-0 flex items-center">
          {data.receiverUsername === profile?.username ? (
            <div
              className="w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_6px_rgba(var(--primary-rgb),0.3)]"
              title="Unread"
            />
          ) : (
            <FaCheck className="text-[10px] text-gray-400" title="Delivered" />
          )}
        </div>
      ) : (
        <div className="shrink-0 flex items-center">
          {data.senderUsername === profile?.username && (
            <img src={doubleCheckmark} alt="" className="w-4 h-4 opacity-70" title="Read" />
          )}
        </div>
      )}
    </div>
  );
};

export default ChatListBody;
