import { FaArrowLeft } from 'react-icons/fa';
import backgroundImage from '../../../assets/images/background.jpg';
import Input from '../../../components/input/Input';
import Button from '../../../components/button/Button';
import { Link, useSearchParams } from 'react-router-dom';
import './ResetPassword.scss';
import { useState } from 'react';
import { authService } from '../../../services/api/auth/auth.service';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [searchParams] = useSearchParams();

  const resetPassword = async (e: React.SubmitEvent) => {
    setLoading(true);
    e.preventDefault();
    try {
      const body = {
        password,
        confirmPassword
      };
      const result = await authService.resetPassword(searchParams.get('token') || '', body);
      setLoading(false);
      setPassword('');
      setConfirmPassword('');
      setShowAlert(false);
      setAlertType('alert-success');
      setResponseMessage(result?.data?.message);
    } catch (error: any) {
      setLoading(false);
      setAlertType('alert-error');
      setShowAlert(true);
      setResponseMessage(error?.response?.data?.message);
    }
  };

  return (
    <div className="container-wrapper" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="environment">DEV</div>
      <div className="container-wrapper-auth">
        <div className="tabs reset-password-tabs" style={{ height: `${responseMessage ? '400px' : ''}` }}>
          <div className="tabs-auth">
            <ul className="tab-group">
              <li className="tab">
                <div className="login reset-password">Reset Password</div>
              </li>
            </ul>
            <div className="tab-item">
              <div className="auth-inner">
                {responseMessage && (
                  <div className={`alerts ${alertType}`} role="alert">
                    {responseMessage}
                  </div>
                )}
                <form className="reset-password-form" onSubmit={resetPassword}>
                  <div className="form-input-container">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={password}
                      labelText="New Password"
                      placeholder="New Password"
                      style={{ border: `${showAlert ? '1px solid #fa9b8a' : ''}` }}
                      handleChange={(e) => setPassword(e.target.value)}
                    />
                    <Input
                      id="cpassword"
                      name="cpassword"
                      type="password"
                      value={confirmPassword}
                      labelText="Confirm Password"
                      placeholder="Confirm Password"
                      style={{ border: `${showAlert ? '1px solid #fa9b8a' : ''}` }}
                      handleChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <Button
                    label={`${loading ? 'Resetting...' : 'RESET PASSWORD'}`}
                    className="auth-button button"
                    disabled={loading || !password || !confirmPassword}
                  />

                  <Link to={'/'}>
                    <span className="login">
                      <FaArrowLeft className="arrow-left" /> Back to Login
                    </span>
                  </Link>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
