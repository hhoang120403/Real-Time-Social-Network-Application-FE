import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import '@components/select-dropdown/SelectDropdown.scss';
import { updatePostItem } from '@redux/reducers/post/post.reducer';
import type { AppDispatch } from '@redux/store';
import type { Privacy } from '@app-types/post';

interface SelectDropdownProps {
  isActive: boolean;
  setSelectedItem: (item: Privacy) => void;
  items: Privacy[];
}

const SelectDropdown = ({ isActive, setSelectedItem, items = [] }: SelectDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();

  const selectItem = (item: any) => {
    setSelectedItem(item);
    dispatch(updatePostItem({ privacy: item.topText }));
  };

  return (
    <div className="menu-container" data-testid="menu-container">
      <nav ref={dropdownRef} className={`menu ${isActive ? 'active' : 'inactive'}`}>
        <ul>
          {items.map((item, index) => (
            <li data-testid="select-dropdown" key={index} onClick={() => selectItem(item)}>
              <div className="menu-icon">{item.icon}</div>
              <div className="menu-text">
                <div className="menu-text-header">{item.topText}</div>
                <div className="sub-header">{item.subText}</div>
              </div>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default SelectDropdown;
