import axios from 'axios';

const GIPHY_URL = 'https://api.giphy.com/v1/gifs';
const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY || import.meta.env.VITE_GIPHY_KEY;

export interface IGiphyResponse {
  data: IGiphyData[];
}

export interface IGiphyData {
  id: string;
  title?: string;
  images?: {
    fixed_width?: {
      url?: string;
      webp?: string;
    };
    fixed_height?: {
      url?: string;
      webp?: string;
    };
    downsized_medium?: {
      url?: string;
    };
    original?: {
      url?: string;
    };
  };
}

class GiphyService {
  private getDefaultParams() {
    if (!GIPHY_API_KEY) {
      throw new Error('Missing Giphy API key');
    }

    return {
      api_key: GIPHY_API_KEY,
      limit: 24,
      rating: 'pg',
      lang: 'en'
    };
  }

  async search(query: string) {
    const response = await axios.get<IGiphyResponse>(`${GIPHY_URL}/search`, {
      params: {
        ...this.getDefaultParams(),
        q: query
      },
      timeout: 10000
    });

    return response;
  }

  async trending() {
    const response = await axios.get<IGiphyResponse>(`${GIPHY_URL}/trending`, {
      params: this.getDefaultParams(),
      timeout: 10000
    });

    return response;
  }
}

export const giphyService = new GiphyService();
