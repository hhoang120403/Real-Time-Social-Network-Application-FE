import { FaArrowLeft } from 'react-icons/fa';
import './ForgotPassword.scss';
import Input from '../../../components/input/Input';
import Button from '../../../components/button/Button';
import backgroundImage from '../../../assets/images/background.jpg';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { authService } from '../../../services/api/auth/auth.service';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [alertType, setAlertType] = useState('');

  const forgotPassword = async (e: React.SubmitEvent) => {
    setLoading(true);
    e.preventDefault();
    try {
      const result = await authService.forgotPassword(email);
      setLoading(false);
      setEmail('');
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
        <div className="tabs forgot-password-tabs" style={{ height: `${responseMessage ? '300px' : ''}` }}>
          <div className="tabs-auth">
            <ul className="tab-group">
              <li className="tab">
                <div className="login forgot-password">Forgot Password</div>
              </li>
            </ul>

            <div className="tab-item">
              <div className="auth-inner">
                {responseMessage && (
                  <div className={`alerts ${alertType}`} role="alert">
                    {responseMessage}
                  </div>
                )}
                <form className="auth-form" onSubmit={forgotPassword}>
                  <div className="form-input-container">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      labelText="Email"
                      placeholder="Enter your email"
                      style={{ border: `${showAlert ? '1px solid #fa9b8a' : ''}` }}
                      handleChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <Button
                    label={`${loading ? 'Sending...' : 'CHANGE PASSWORD'}`}
                    className="auth-button button"
                    disabled={loading || !email}
                  />

                  <Link to="/">
                    <span className="forgot-password">
                      <FaArrowLeft className="arrow-left" /> Back to Sign In
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

export default ForgotPassword;
