import { GiphyUtils } from '@services/utils/giphy-utils.service';
import { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { Box, CircularProgress, InputBase } from '@mui/material';
import type { IGiphyData } from '@services/api/giphy/giphy.service';

interface GiphyContainerProps {
  handleGiphyClick: (gifUrl: string) => void;
}

const GiphyContainer = ({ handleGiphyClick }: GiphyContainerProps) => {
  const [gifs, setGifs] = useState<IGiphyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    GiphyUtils.getTrendingGifs(setGifs, setLoading, setError);
  }, []);

  const hasEmptyState = !loading && gifs.length === 0;

  return (
    <Box
      className="absolute bottom-14 left-2 z-30 h-[360px] w-[310px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl before:absolute before:bottom-[-8px] before:left-8 before:h-4 before:w-4 before:rotate-45 before:border-b before:border-r before:border-slate-200 before:bg-white"
      data-testid="giphy-container"
    >
      <Box className="relative border-b border-slate-100 p-3">
        <Box className="flex items-center rounded-xl bg-slate-100 px-3 transition-all focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
          <FaSearch className="mr-2 text-[14px] text-blue-600" />
          <InputBase
            id="gif"
            name="gif"
            type="text"
            placeholder="Search Gif"
            className="flex-1 py-1.5 text-[14px] font-medium text-slate-700"
            onChange={(e) => GiphyUtils.searchGifs(e.target.value, setGifs, setLoading, setError)}
          />
        </Box>
      </Box>
      {loading && (
        <Box className="absolute inset-x-0 top-16 z-10 flex justify-center">
          <Box className="rounded-full bg-white/90 p-2 shadow-md">
            <CircularProgress size={22} className="text-blue-600" />
          </Box>
        </Box>
      )}
      {hasEmptyState ? (
        <Box className="flex h-[292px] items-center justify-center px-8 text-center text-[13px] font-medium text-slate-500">
          {error || 'No GIFs to display.'}
        </Box>
      ) : (
        <ul className="grid h-[292px] grid-cols-2 list-none gap-2 overflow-y-auto p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {gifs.map((gif) => {
            const gifUrl = GiphyUtils.getGifUrl(gif);

            return (
              <li
                className="h-[118px] overflow-hidden rounded-xl bg-slate-100 shadow-sm transition-transform hover:scale-[1.02]"
                data-testid="list-item"
                key={gif.id}
                onClick={() => handleGiphyClick(gif.images?.original?.url || gifUrl)}
              >
                <img src={gifUrl} className="h-full w-full cursor-pointer object-cover" alt={gif.title || 'GIF'} />
              </li>
            );
          })}
        </ul>
      )}
    </Box>
  );
};

export default GiphyContainer;
