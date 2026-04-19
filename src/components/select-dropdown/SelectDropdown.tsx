import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePostItem } from '@redux/reducers/post/post.reducer';
import type { AppDispatch, RootState } from '@redux/store';
import type { Privacy } from '@app-types/post';

interface SelectDropdownProps {
  isActive: boolean;
  setSelectedItem: (item: Privacy) => void;
  items: Privacy[];
  toggleDropdown: (active: boolean) => void;
}

const SelectDropdown = ({ isActive, setSelectedItem, items = [], toggleDropdown }: SelectDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { privacy } = useSelector((state: RootState) => state.post);
  const dispatch = useDispatch<AppDispatch>();

  const selectItem = (item: any) => {
    setSelectedItem(item);
    dispatch(updatePostItem({ privacy: item.topText }));
    toggleDropdown(false);
  };

  if (!isActive) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-0 left-0 z-999 w-[250px] bg-white rounded-xl shadow-[0_12px_28px_0_rgba(0,0,0,0.2),0_2px_4px_0_rgba(0,0,0,0.1)] border border-[#e4e6eb] p-1.5 animate-in fade-in zoom-in-95 duration-200"
      data-testid="menu-container"
    >
      <div className="text-center py-1.5 border-b border-[#e4e6eb] mb-1.5">
        <h3 className="font-bold text-[16px] text-[#050505]">Select Audience</h3>
      </div>
      <ul className="flex flex-col gap-1">
        {items.map((item, index) => {
          const isSelected = item.topText === (privacy || 'Public');
          return (
            <li
              data-testid="select-dropdown"
              key={index}
              className="flex items-center gap-3 p-2 hover:bg-[#f2f3f5] active:bg-[#e4e6eb] rounded-lg cursor-pointer transition-colors group"
              onClick={() => selectItem(item)}
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#e4e6eb] text-[#050505] shrink-0 group-hover:bg-[#d8dadf]">
                <div className="scale-125">{item.icon}</div>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="text-[14.5px] font-bold text-[#050505] leading-tight">{item.topText}</div>
                <div className="text-[12px] text-[#65676b] leading-tight">{item.subText}</div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-primary' : 'border-[#65676b] group-hover:border-[#050505]'} shrink-0`}
              >
                {isSelected && <div className="w-3 h-3 rounded-full bg-primary animate-in zoom-in duration-200"></div>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SelectDropdown;
