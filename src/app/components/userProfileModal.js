import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Form, Divider, notification } from 'antd';
import axios from 'axios';
import { DeleteOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

const UserProfileModal = ({ isVisible, onClose }) => {
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { dispatch } = useAuth();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    document.cookie = 'token=; max-age=0';
    router.push('/');
  };

  const handleEmailChange = () => {
    setError('');
    // Implement the email update logic
    axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/update/email`, { email },
      {withCredentials: true})
      .then((response) => {
        console.log('Success updating email');
        notification.success({
          message: 'Email Updated',
          description: 'Your email has been successfully updated.'
        });
      })
      .catch((error) => {
        console.error('Error:', error);
        if (error.response.status === 409) {
          setError('Email already exists. Please use a different email.');
        } else {
          notification.error({
            message: 'Email Update Error',
            description: 'Failed to update your email. Please try again.'
          });
        }
      });
  };

  const handlePasswordChange = async () => {
    console.log('oldPassword', oldPassword);
    setError('');
    // Implement the password update logic
    axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/update/password`, { oldPassword, newPassword },
      {withCredentials: true})
      .then((response) => {
        console.log('Success updating password');
        notification.success({
          message: 'Password Updated',
          description: 'Your password has been successfully updated.'
        });
      })
      .catch((error) => {
        console.error('Error:', error);
        if (error.response.status === 401) {
          setError('Old password is incorrect. Please try again.');
          return;
        } else {
          notification.error({
            message: 'Password Update Error',
            description: 'Failed to update your password. Please try again.'
          });
        }
      });
  };

  const handleUsernameChange = () => {
    setError('');
    // Implement the username update logic
    axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/update/username`, { userName },
      {withCredentials: true})
      .then((response) => {
        console.log('Success updating username');
        notification.success({
          message: 'Username Updated',
          description: 'Your username has been successfully updated.'
        });
      })
      .catch((error) => {
        console.error('Error:', error);
        if (error.response.status === 409) {
          setError('Username already exists. Please use a different username.');
        } else {
          notification.error({
            message: 'Username Update Error',
            description: 'Failed to update your username. Please try again.'
          });
        }
      
      });
  };

    // Reset form and error state when the modal is closed
    useEffect(() => {
      if (!isVisible) {
        setEmail('');
        setUserName('');
        setOldPassword('');
        setNewPassword('');
        setError('');
      }
    }, [isVisible]);
  const handleDeleteAccount = () => {
    Modal.confirm({
      title: 'Are you sure you want to delete your account?',
      content: 'This action is irreversible. All your data will be permanently deleted.',
      okText: 'Yes, delete my account',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/user/delete`, { withCredentials: true })
          .then(() => {
            notification.success({
              message: 'Account Deleted',
              description: 'Your account has been successfully deleted.',
            });
            // Call a prop function to handle user logout or redirect after deletion
            handleLogout();
          })
          .catch(error => {
            console.error('Error:', error);
            notification.error({
              message: 'Account Deletion Error',
              description: 'An error occurred while trying to delete your account. Please try again.',
            });
          });
      },
    });
  };


  return (
    <Modal
      title="Profile Settings"
      open={isVisible}
      onCancel={onClose}
      footer={null}
      styles={{ 
        body: { 
          backgroundColor: 'white', 
          padding: '20px',
        },
      }} 
    >
      <Form layout="vertical">
        {/* Username Update Section */}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <Form.Item label="New Username" style={{ marginBottom: '10px' }}>
          <Input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            style={{ height: '40px' }}
            autoComplete="off"
          />
          <Button
            type="primary"
            onClick={handleUsernameChange}
            style={{
              marginTop: '10px',
              backgroundColor: 'blue',
              borderColor: 'blue',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            Change Username
          </Button>
        </Form.Item>
        <Divider />

        {/* Email Update Section */}
        <Form.Item label="New Email" style={{ marginBottom: '10px' }}>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ height: '40px' }}
            autoComplete="off"
          />
          <Button
            type="primary"
            onClick={handleEmailChange}
            style={{
              marginTop: '10px',
              backgroundColor: 'green',
              borderColor: 'green',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            Change Email
          </Button>
        </Form.Item>
        <Divider />

        {/* Password Update Section */}
        <Form.Item label="Old Password" style={{ marginBottom: '10px' }}>
          <Input.Password
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            style={{ height: '40px' }}
          />
        </Form.Item>
        <Form.Item label="New Password" style={{ marginBottom: '10px' }}>
          <Input.Password
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ height: '40px' }}
            autoComplete="new-password"
          />
          <Button
            type="primary"
            onClick={handlePasswordChange}
            style={{
              marginTop: '10px',
              backgroundColor: 'red',
              borderColor: 'red',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            Change Password
          </Button>
        </Form.Item>
        <Divider />

        {/* Delete Account Section */}
        <Form.Item>
          <DeleteOutlined
            onClick={handleDeleteAccount}
            style={{ color: 'red', fontSize: '24px', cursor: 'pointer' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserProfileModal;
