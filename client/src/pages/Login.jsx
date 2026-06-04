import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { loginUser } from '../api';
import toast, { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, logoutUser } from '../redux/action/userAction';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.handleUser.user);

  // Auto-logout if localStorage is removed
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser && user) {
        dispatch(logoutUser());
        navigate('/login');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, [dispatch, navigate, user]);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Email required'),
      password: Yup.string().min(6, 'Min 6 chars').required('Password required')
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await loginUser(values);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        dispatch(setUser(response.user));
        toast.success('Login Successful!');
        resetForm();

        // Redirect based on role
        if (response.user.role === 'ADMIN') navigate('/');
        else if (response.user.role === 'MERCHANT') navigate('/merchant');
        else navigate('/');
      } catch (error) {
        toast.error('Login Failed!');
      }
    }
  });

  const handleGoogleLogin = () => {
    window.location.href = "https://www.bagsverse.com/api/auth/google";
  };

  return (
    <>
      <Toaster position='top-right' />

      <div className='container my-3 py-3'>
        <h1 className='text-center'>Login</h1>
        <hr />
        <div className='row my-4 h-100'>
          <div className='col-md-4 col-lg-4 col-sm-8 mx-auto'>
            <form onSubmit={formik.handleSubmit}>
              {/* Email */}
              <div className='form my-3'>
                <label>Email Address</label>
                <input
                  type='email'
                  placeholder='name@example.com'
                  className={`form-control ${formik.touched.email && formik.errors.email
                    ? 'is-invalid'
                    : ''
                    }`}
                  {...formik.getFieldProps('email')}
                />
                {formik.touched.email && formik.errors.email && (
                  <small className='text-danger'>{formik.errors.email}</small>
                )}
              </div>

              {/* Password */}
              <div className='form my-3 position-relative'>
                <label>Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Password'
                  className={`form-control ${formik.touched.password && formik.errors.password
                    ? 'is-invalid'
                    : ''
                    }`}
                  {...formik.getFieldProps('password')}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '40px',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
                {formik.touched.password && formik.errors.password && (
                  <small className='text-danger'>
                    {formik.errors.password}
                  </small>
                )}
              </div>

              {/* <p>
                New Here?{' '}
                <Link
                  to='/register'
                  className='text-info text-decoration-underline'
                >
                  Register
                </Link>
              </p> */}

              <div className='text-center'>
                <button className='my-2 btn btn-dark w-100' type='submit'>
                  Login
                </button>
              </div>
            </form>
            <div className="text-center my-3">
              <span className="text-muted">OR</span>
            </div>

            <div className="text-center">
              <button
                type="button"
                className="btn btn-outline-dark w-100 d-flex align-items-center justify-content-center"
                onClick={handleGoogleLogin}
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  style={{ width: "20px", marginRight: "10px" }}
                />
                Login with Google
              </button>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default Login;
