import './Register.scss';
import Input from '../../../components/input/Input';
import Button from '../../../components/button/Button';

const Register = () => {
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

          {/* email field */}
          <Input
            id="email"
            name="email"
            type="text"
            value="my email"
            labelText="Email"
            placeholder="Enter your email"
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
        </div>

        {/* button component */}
        <Button label="Register" className="auth-button button" disabled={true} />
      </form>
    </div>
  );
};

export default Register;
