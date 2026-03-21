import Button from '@components/button/Button';
import { Fragment } from 'react';

interface ICardElementButtons {
  isChecked: boolean;
  btnTextOne: string;
  btnTextTwo: string;
  onClickBtnOne: () => void;
  onClickBtnTwo: () => void;
  onNavigateToProfile: () => void;
}

const CardElementButtons = ({
  isChecked,
  btnTextOne,
  btnTextTwo,
  onClickBtnOne,
  onClickBtnTwo,
  onNavigateToProfile
}: ICardElementButtons) => {
  return (
    <div className="card-element-buttons" data-testid="card-element-buttons">
      <Fragment>
        {!isChecked && (
          <Button label={btnTextOne} className="card-element-buttons-btn button" handleClick={onClickBtnOne} />
        )}
        {isChecked && (
          <Button
            label={btnTextTwo}
            className="card-element-buttons-btn button isUserFollowed"
            handleClick={onClickBtnTwo}
          />
        )}
      </Fragment>
      <Button label="Profile" className="card-element-buttons-btn button" handleClick={onNavigateToProfile} />
    </div>
  );
};

export default CardElementButtons;
