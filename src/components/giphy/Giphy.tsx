import Input from '@components/input/Input';
import { GiphyUtils } from '@services/utils/giphy-utils.service';
import { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import '@components/giphy/Giphy.scss';
import { useDispatch } from 'react-redux';
import { type AppDispatch } from '@redux/store';
import { updatePostItem } from '@redux/reducers/post/post.reducer';
import { toggleGifModal } from '@redux/reducers/modal/modal.reducer';
import { useSelector } from 'react-redux';
import { type RootState } from '@redux/store';
import Spinner from '@components/spinner/Spinner';
import { Utils } from '@services/utils/utils.service';

interface GiphyProps {
  onGifSelect?: (gifUrl: string) => void;
}

const Giphy = ({ onGifSelect }: GiphyProps) => {
  const { gifModalIsOpen } = useSelector((state: RootState) => state.modal);
  const [gifs, setGifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const selectGif = (gif: any) => {
    if (onGifSelect) {
      onGifSelect(gif);
    } else {
      dispatch(updatePostItem({ gifUrl: gif, image: '', video: '', videoId: '', videoVersion: '' }));
    }
    dispatch(toggleGifModal(!gifModalIsOpen));
  };

  useEffect(() => {
    GiphyUtils.getTrendingGifs(setGifs, setLoading);
  }, []);

  return (
    <>
      <div className="giphy-container" id="editable" data-testid="giphy-container">
        <div className="giphy-container-picker" style={{ height: '500px' }}>
          <div className="giphy-container-picker-form">
            <FaSearch className="search" />
            <Input
              id="gif"
              name="gif"
              type="text"
              labelText=""
              placeholder="Search Gif"
              className="giphy-container-picker-form-input"
              onChange={(e) => GiphyUtils.searchGifs(e.target.value, setGifs, setLoading)}
            />
          </div>

          {loading && <Spinner />}

          <ul className="giphy-container-picker-list" data-testid="unorderedList">
            {gifs.map((gif) => (
              <li
                className="giphy-container-picker-list-item"
                data-testid="list-item"
                key={Utils.generateString(10)}
                onClick={() => selectGif(gif.images.original.url)}
              >
                <img style={{ width: '470px' }} src={`${gif.images.original.url}`} alt="" />
              </li>
            ))}
          </ul>

          {!gifs && !loading && (
            <ul className="giphy-container-picker-list">
              <li className="giphy-container-picker-list-no-item">No GIF found</li>
            </ul>
          )}
        </div>
      </div>
    </>
  );
};
export default Giphy;
