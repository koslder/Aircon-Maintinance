import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(''); // Clear any previous error messages

    try {
      const response = await axios.post('https://capstone-sever.onrender.com/api/login', {
        username,
        password,
      });

      const { token, admin } = response.data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('firstname', admin.firstname);
      localStorage.setItem('lastname', admin.lastname);
      localStorage.setItem('id', admin.id);

      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login Error:', error.response ? error.response.data : error.message);
      setErrorMessage('Invalid Credentials. Please try again.');
    } finally {
      setLoading(false); // Ensure loading is always set to false after the request completes
    }
  };

  return (
    <section className="login-page">
      <div className="container">
        <div className="login-page-container">
          <div className="col-1"></div>
          <div className="col-2">
            <div className="login">
              <div className="login-container">
                <form onSubmit={handleLogin}>
                  <div className="username">
                    <p>Username</p>
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="password">
                    <p>Password</p>
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {errorMessage && <p className="error-message">{errorMessage}</p>}
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={loading}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;

