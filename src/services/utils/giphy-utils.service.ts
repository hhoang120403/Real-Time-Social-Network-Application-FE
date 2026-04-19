import { giphyService, type IGiphyData, type IGiphyResponse } from '@services/api/giphy/giphy.service';
import type { AxiosResponse } from 'axios';
import type { Dispatch, SetStateAction } from 'react';

type SetGifs = Dispatch<SetStateAction<IGiphyData[]>>;
type SetLoading = Dispatch<SetStateAction<boolean>>;
type SetError = Dispatch<SetStateAction<string>>;

export class GiphyUtils {
  static getGifUrl(gif: IGiphyData) {
    return (
      gif.images?.fixed_width?.webp ||
      gif.images?.fixed_width?.url ||
      gif.images?.fixed_height?.webp ||
      gif.images?.fixed_height?.url ||
      gif.images?.downsized_medium?.url ||
      gif.images?.original?.url ||
      ''
    );
  }

  private static getGifList(response: AxiosResponse<IGiphyResponse>) {
    const gifs = response.data?.data;
    return Array.isArray(gifs) ? gifs.filter((gif) => GiphyUtils.getGifUrl(gif)) : [];
  }

  static async getTrendingGifs(setGifs: SetGifs, setLoading: SetLoading, setError?: SetError) {
    setLoading(true);
    setError?.('');

    try {
      const response = await giphyService.trending();
      setGifs(GiphyUtils.getGifList(response));
    } catch (error) {
      setGifs([]);
      setError?.('Unable to load GIFs. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  static async searchGifs(gif: string, setGifs: SetGifs, setLoading: SetLoading, setError?: SetError) {
    const searchTerm = gif.trim();

    if (searchTerm.length <= 1) {
      GiphyUtils.getTrendingGifs(setGifs, setLoading, setError);
      return;
    }

    setLoading(true);
    setError?.('');

    try {
      const response = await giphyService.search(searchTerm);
      setGifs(GiphyUtils.getGifList(response));
    } catch (error) {
      setGifs([]);
      setError?.('Unable to search GIFs. Please try again.');
    } finally {
      setLoading(false);
    }
  }
}
