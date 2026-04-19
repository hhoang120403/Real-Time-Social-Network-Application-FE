import Avatar from '@components/avatar/Avatar';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useLocation, useNavigate, createSearchParams } from 'react-router-dom';
import type { IUser } from '@root/types/user';

interface SearchListProps {
  result: IUser[];
  isSearching: boolean;
  searchTerm: string;
  setSelectedUser: (user: IUser) => void;
  setSearch: (search: string) => void;
  setIsSearching: (isSearching: boolean) => void;
  setSearchResult: (result: IUser[]) => void;
  setComponentType: (componentType: string) => void;
}

const SearchList = ({
  result,
  isSearching,
  searchTerm,
  setSelectedUser,
  setSearch,
  setIsSearching,
  setSearchResult,
  setComponentType
}: SearchListProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const addUsernameToUrlQuery = (user: IUser) => {
    setComponentType('searchList');
    setSelectedUser(user);
    const url = `${location.pathname}?${createSearchParams({ username: user.username.toLowerCase(), id: user._id })}`;
    navigate(url);
    setSearch('');
    setIsSearching(false);
    setSearchResult([]);
  };

  return (
    <Box className="h-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Box className="flex flex-col gap-1">
        {!isSearching && result?.length > 0 && (
          <>
            {result.map((user) => (
              <Box
                data-testid="search-result-item"
                className="flex w-full cursor-pointer items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-slate-50"
                key={user._id}
                onClick={() => addUsernameToUrlQuery(user)}
              >
                <Avatar
                  name={user.username}
                  bgColor={user.avatarColor}
                  textColor="#ffffff"
                  size={40}
                  avatarSrc={user.profilePicture}
                />
                <Typography className="min-w-0 flex-1 truncate text-[14px] font-bold text-slate-900">
                  {user.username}
                </Typography>
              </Box>
            ))}
          </>
        )}

        {searchTerm && isSearching && result?.length === 0 && (
          <Box
            className="flex flex-col items-center justify-center gap-3 py-10 text-center"
            data-testid="searching-text"
          >
            <CircularProgress size={24} className="text-blue-600" />
            <Typography className="text-[14px] font-semibold text-slate-500">Searching...</Typography>
          </Box>
        )}

        {searchTerm && !isSearching && result?.length === 0 && (
          <Box className="px-6 py-10 text-center" data-testid="nothing-found">
            <Typography className="text-[16px] font-bold text-slate-700">Nothing found</Typography>
            <Typography className="mt-1 break-words text-[13px] text-slate-400">
              We couldn&apos;t find any match for {searchTerm}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SearchList;
