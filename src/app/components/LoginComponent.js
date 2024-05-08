"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { storeToken } from '../components/AuthComponent';
import { useRouter } from 'next/navigation';

function Login() {
  const router = useRouter();
  const [loginData, setLoginData] = useState({
    userNameOrEmail: '',
    password: '',
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isComponentMounted, setIsComponentMounted] = useState(false);

  // Set the isComponentMounted to true after the component is mounted
  useEffect(() => {
    setIsComponentMounted(true);
  }, []);

  const handleChange = (event) => {
    setLoginData({
      ...loginData,
      [event.target.name]: event.target.value,
    });
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Handle login logic here
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/login`, loginData);
      console.log(response);
      setLoginData({
        userNameOrEmail: '',
        password: '',
      });

      // Store token in cookies
      storeToken(response.data.token);
      console.log('Token stored in cookies is', response.data.token);

      // Redirect to home page, only if the component is mounted
      if (isComponentMounted) {
        router.push('/');
      }
    }
    catch (error) {
      console.error(error);

      if (error.response && error.response.status === 401) {
        setErrorMessage("Invalid username or password. Please try again.");
      }
      else {
        setErrorMessage('An error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-600">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg">
        <h3 className="text-2xl font-bold text-center">Login to Veenote</h3>
        <form onSubmit={handleSubmit}>
          {/* if error message*/}
          {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
          <div className="mt-4">
            <label className="block" htmlFor="usernameOrEmail">Username or Email</label>
            <input
              type="text"
              placeholder="Username or Email"
              name="userNameOrEmail"
              id="userNameOrEmail"
              onChange={handleChange}
              value={loginData.userNameOrEmail}
              className="w-full px-4 py-2 mt-2 border rounded-md text-gray-700"
              required
              autoComplete="off"
            />
          </div>
          <div className="mt-4 flex items-center">
            <div className="flex-grow">
              <label className="block" htmlFor="password">Password</label>
              <input
                type={isPasswordVisible ? "text" : "password"}
                placeholder="Password"
                name="password"
                id="password"
                onChange={handleChange}
                value={loginData.password}
                className="w-full px-4 py-2 mt-2 border rounded-md text-gray-700"
                required
                autoComplete="new-password"
              />
            </div>
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="ml-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md mt-8"
            >
            {isPasswordVisible ? (
              // Crossed Eye SVG Icon
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" /> {/* This line adds a "cross" effect */}
              </svg>
              ) : (
              // Eye SVG Icon
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825L10.05 15m-6.9-3C4.732 7.943 8.523 5 13 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-1.386 0-2.72-.305-3.95-.842M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              )}

            </button>
          </div>
          <div className="mt-4">
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Login
            </button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <p> Don't have an account? <Link href="/register" className="text-blue-600 hover:text-blue-800"> Sign Up </Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
