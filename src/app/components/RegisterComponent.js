'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { notification } from 'antd';

export default function Register() {
  const [userName, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      return;
    }
    setErrorMessage('');
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/create`, {
        userName,
        email,
        password,
      });
      console.log(response);
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      notification.success({
        message: 'Success',
        description: 'User registered successfully',
      });
      router.push('/login');
    } catch (error) {
      console.error(error);
      setErrorMessage(error.response?.data?.message || 'An error occurred. Please try again later.');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setConfirmPasswordError(e.target.value !== password ? 'Passwords do not match.' : '');
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-600">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg">
        <h3 className="text-2xl font-bold text-center mb-4">Register for Veenote</h3>
        <form onSubmit={handleSubmit} autoComplete="off">
          {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
          <div>
            <label className="block" htmlFor="username">Username</label>
            <input
              type="text"
              placeholder="Username"
              id="username"
              autoComplete="off"
              onChange={(e) => setUsername(e.target.value)}
              value={userName}
              className="w-full px-4 py-2 mt-2 border rounded-md text-gray-700"
              required
            />
          </div>
          <div className="mt-4">
            <label className="block" htmlFor="email">Email</label>
            <input
              type="email"
              placeholder="Email"
              id="email"
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="w-full px-4 py-2 mt-2 border rounded-md text-gray-700"
              required
            />
          </div>
          <div className="mt-4">
            <label className="block" htmlFor="password">Password</label>
            <input
              type={isPasswordVisible ? "text" : "password"}
              placeholder="Password"
              id="password"
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="w-full px-4 py-2 mt-2 border rounded-md text-gray-700"
              required
            />
          </div>
          <div className="mt-4">
            <label className="block" htmlFor="confirmPassword">Confirm Password</label>
            <input
              type={isPasswordVisible ? "text" : "password"}
              placeholder="Confirm Password"
              id="confirmPassword"
              autoComplete="new-password"
              onChange={handleConfirmPasswordChange}
              value={confirmPassword}
              className="w-full px-4 py-2 mt-2 border rounded-md text-gray-700"
              required
            />
            {confirmPasswordError && <p className="text-red-500">{confirmPasswordError}</p>}
          </div>
          <button type="button" onClick={togglePasswordVisibility} className="mt-2 text-sm text-blue-600 hover:text-blue-800">Show/Hide Password</button>
          <div className="flex items-baseline justify-between">
            <button type="submit" className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900">Register</button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <p>Already have an account? <Link href="/login" className="text-blue-600 hover:text-blue-800"> Login</Link></p>
        </div>
      </div>
    </div>
  );
}
