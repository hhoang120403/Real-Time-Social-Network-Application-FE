import { FaArrowRight } from 'react-icons/fa';
import './Login.scss';
import Input from '../../../components/input/Input';
import Button from '../../../components/button/Button';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="auth-inner">
      {/* <div className="alerts alert-success" role="alert">
        Error message
      </div> */}
      <form className="auth-form">
        <div className="form-input-container">
          {/* username field */}
          <Input
            id="username"
            name="username"
            type="text"
            value="my value"
            labelText="Username"
            placeholder="Enter your username"
            handleChange={() => {}}
          />

          {/* password field */}
          <Input
            id="password"
            name="password"
            type="password"
            value="my password"
            labelText="Password"
            placeholder="Enter your password"
            handleChange={() => {}}
          />

          <label className="checkmark-container" htmlFor="checkbox">
            <Input id="checkbox" type="checkbox" name="checkbox" value={false} />
            Keep me signed in
          </label>
        </div>

        {/* button component */}
        <Button label="Login" className="auth-button button" disabled={true} />

        {/* forgot password */}
        <Link to="/forgot-password">
          <span className="forgot-password">
            Forgot password? <FaArrowRight className="arrow-right" />
          </span>
        </Link>
      </form>
    </div>
  );
};

export default Login;
