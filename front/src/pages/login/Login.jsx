import React from 'react';
import { backgroundStyle } from '../images/backgroundStyle';
import './Login.css';

const Login = () => {

  const handleLogin = (provider) => {
    if (provider === 'google') {
      window.location.href = 'http://localhost:8888/auth/google';  // 서버로 리다이렉션
    } else if (provider === 'spotify') {
      window.location.href = 'http://localhost:8888/auth/spotify';  // 서버로 리다이렉션
    }
  };

  return (
    <div className="background-container" style={backgroundStyle}>
      <div className="login-form">
        <h1 className="login-title">LOGIN</h1>
        <div className="login-btns">
          <button className="login-btn" onClick={() => handleLogin('spotify')}>
            <img src="/images/spotify-logo.svg" alt="Spotify 로고" width="100" height="31" />
            <span>로그인</span>
          </button>
          <button className="login-btn" onClick={() => handleLogin('google')}>
            <img src="/images/google-logo.svg" alt="Google 로고" />
            <span className="google">oogle</span><span className="google-login"> 로그인</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
