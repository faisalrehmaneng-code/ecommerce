import React, { useState } from 'react';

import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { registerUser } from '../api';
import toast, { Toaster } from 'react-hot-toast';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);

  // Formik Setup
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    },

    validationSchema: Yup.object({
      firstName: Yup.string()
        .min(2, 'Too Short!')
        .max(20, 'Too Long!')
        .required('First name is required'),
      lastName: Yup.string()
        .min(2, 'Too Short!')
        .max(20, 'Too Long!')
        .required('Last name is required'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required')
    }),

    onSubmit: async (values, { resetForm }) => {
      try {
        registerUser(values);
        toast.success('Registration Successful!');
        resetForm();
      } catch (error) {
        console.log(error);
        toast.error('Registration Failed!');
      }
    }
  });

  return (
    <>
      {/* Hot Toast Component */}
      <Toaster position='center' reverseOrder={false} />


      <div className='container my-3 py-3'>
        <h1 className='text-center'>Register</h1>
        <hr />
        <div className='row my-4 h-100'>
          <div className='col-md-4 col-lg-4 col-sm-8 mx-auto'>
            <form onSubmit={formik.handleSubmit}>
              {/* First Name */}
              <div className='form my-3'>
                <label htmlFor='firstName'>First Name</label>
                <input
                  type='text'
                  id='firstName'
                  placeholder='Enter Your First Name'
                  className={`form-control ${formik.touched.firstName && formik.errors.firstName
                    ? 'is-invalid'
                    : ''
                    }`}
                  {...formik.getFieldProps('firstName')}
                />
                {formik.touched.firstName && formik.errors.firstName && (
                  <small className='text-danger'>
                    {formik.errors.firstName}
                  </small>
                )}
              </div>

              {/* Last Name */}
              <div className='form my-3'>
                <label htmlFor='lastName'>Last Name</label>
                <input
                  type='text'
                  id='lastName'
                  placeholder='Enter Your Last Name'
                  className={`form-control ${formik.touched.lastName && formik.errors.lastName
                    ? 'is-invalid'
                    : ''
                    }`}
                  {...formik.getFieldProps('lastName')}
                />
                {formik.touched.lastName && formik.errors.lastName && (
                  <small className='text-danger'>
                    {formik.errors.lastName}
                  </small>
                )}
              </div>

              {/* Email */}
              <div className='form my-3'>
                <label htmlFor='email'>Email Address</label>
                <input
                  type='email'
                  id='email'
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
                <label htmlFor='password'>Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id='password'
                  placeholder='Password'
                  className={`form-control ${formik.touched.password && formik.errors.password
                    ? 'is-invalid'
                    : ''
                    }`}
                  {...formik.getFieldProps('password')}
                />

                {/* Eye Icon */}
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

              {/* Already Has Account Link */}
              <div className='my-3'>
                <p>
                  Already have an account?{' '}
                  <Link
                    to='/login'
                    className='text-decoration-underline text-info'
                  >
                    Login
                  </Link>
                </p>
              </div>

              {/* Submit Button */}
              <div className='text-center'>
                <button className='my-2 btn btn-dark w-100' type='submit'>
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </>
  );
};

export default Register;
