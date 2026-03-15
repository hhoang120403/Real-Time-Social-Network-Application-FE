import { useEffect, useState, type RefObject, type Dispatch, type SetStateAction } from 'react';

const useDetectOutsideClick = (
  ref: RefObject<HTMLElement | null>,
  initialState: boolean
): [boolean, Dispatch<SetStateAction<boolean>>] => {
  const [isActive, setIsActive] = useState(initialState);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (ref.current && !ref.current.contains(target)) {
        setIsActive(!isActive);
      }
    };

    if (isActive) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, isActive]);

  return [isActive, setIsActive];
};

export default useDetectOutsideClick;
