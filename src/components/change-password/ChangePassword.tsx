import Button from '@components/button/Button';
import '@components/change-password/ChangePassword.scss';
import Input from '@components/input/Input';
import useLocalStorage from '@hooks/useLocalStorage';
import useSessionStorage from '@hooks/useSessionStorage';
import type { AppDispatch } from '@redux/store';
import { startAuthTransition } from '@services/axios';
import { userService } from '@services/api/user/user.service';
import { Utils } from '@services/utils/utils.service';
import { useState } from 'react';
import { FaRegEye, FaRegEyeSlash, FaLock } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [type, setType] = useState('password');
  const [togglePassword, setTogglePassword] = useState(false);
  const [deleteStorageUsername] = useLocalStorage('username', 'delete');
  const [setLoggedIn] = useLocalStorage('keepLoggedIn', 'set');
  const [deleteSessionPageReload] = useSessionStorage('pageReload', 'delete');
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const togglePasswordDisplay = () => {
    setTogglePassword(!togglePassword);
    const inputType = type === 'password' ? 'text' : 'password';
    setType(inputType);
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await userService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (response) {
        startAuthTransition();
        Utils.dispatchNotification(response.data.message, 'success', dispatch);
        setTimeout(async () => {
          Utils.clearStore({
            dispatch,
            deleteStorageUsername,
            deleteSessionPageReload,
            setLoggedIn
          });
          try {
            await userService.logoutUser();
          } catch (_) {}
          navigate('/');
        }, 3000);
      }
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  return (
    <div className="password-change-container" data-testid="change-password">
      <div className="password-header">
        <div className="header-icon">
          <FaLock />
        </div>
        <h3>Security Settings</h3>
      </div>
      <form onSubmit={changePassword}>
        <div className="form-group">
          <Input
            id="currentPassword"
            name="currentPassword"
            type={type}
            value={currentPassword}
            labelText="Current Password"
            placeholder="Enter your current password"
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
        </div>
        <div className="form-group">
          <Input
            id="newPassword"
            name="newPassword"
            type={type}
            value={newPassword}
            labelText="New Password"
            placeholder="Enter your new password"
            onChange={(event) => setNewPassword(event.target.value)}
          />
        </div>
        <div className="form-group">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={type}
            value={confirmPassword}
            labelText="Confirm Password"
            placeholder="Confirm your new password"
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>

        <div className="form-group form-btn-group">
          <div className="btn-group">
            <Button
              label="Update Password"
              className="update"
              disabled={!currentPassword || !newPassword || !confirmPassword}
            />
            <span className="eye-icon" data-testid="eye-icon" onClick={togglePasswordDisplay}>
              {!togglePassword ? <FaRegEyeSlash title="Show password" /> : <FaRegEye title="Hide password" />}
            </span>
          </div>
        </div>
      </form>
    </div>
  );
};
export default ChangePassword;
