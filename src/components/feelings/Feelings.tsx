import { addPostFeeling, toggleFeelingModal } from '@redux/reducers/modal/modal.reducer';
import { feelingsList } from '@services/utils/static.data';
import { useDispatch, useSelector } from 'react-redux';
import '@components/feelings/Feelings.scss';
import type { RootState } from '@redux/store';
import type { Feeling } from '@app-types/post';

const Feelings = ({ onSelection }: { onSelection?: () => void }) => {
  const { feelingsIsOpen, feeling: selectedFeeling } = useSelector((state: RootState) => state.modal);
  const dispatch = useDispatch();

  const selectFeeling = (feeling: Feeling) => {
    // Toggle logic: if clicking the same feeling, remove it
    if (selectedFeeling && (selectedFeeling as any).name === feeling.name) {
      dispatch(addPostFeeling({ feeling: '' }));
    } else {
      dispatch(addPostFeeling({ feeling }));
    }

    dispatch(toggleFeelingModal(!feelingsIsOpen));
    if (onSelection) {
      onSelection();
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-xl border border-[#e5e5e5] overflow-hidden w-full select-none"
      data-testid="feelings-container"
    >
      <div className="p-3">
        <p className="font-bold text-[17px] text-[#050505] mb-2 px-1">Feelings</p>
        <div className="h-[0.5px] bg-[#e5e5e5] w-full mb-1"></div>
        <ul className="max-h-[300px] overflow-y-auto custom-scrollbar">
          {feelingsList.map((feeling) => {
            const isSelected = selectedFeeling && (selectedFeeling as any).name === feeling.name;
            return (
              <li
                data-testid="feelings-item"
                className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-[#e7f3ff] hover:bg-[#dbeafe]' : 'hover:bg-[#f2f3f5]'}`}
                key={feeling.index}
                onClick={() => selectFeeling(feeling)}
              >
                <img src={feeling.image} alt="" className="w-9 h-9 object-contain" />
                <span className={`text-[15px] ${isSelected ? 'text-[#1877f2] font-semibold' : 'text-[#050505]'}`}>
                  {feeling.name}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
export default Feelings;
