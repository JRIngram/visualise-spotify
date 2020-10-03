import React, { Component } from 'react';
import './Login.css';

class Login extends Component {
  constructor() {
    super();
    this.state = {
      environment: null,
    };
  }

  componentDidMount() {
    this.setState({
      environment: this.getEnvironment(),
    });
  }

  getEnvironment() {
    this.url = window.location.href;
    if (this.url.includes('localhost')) {
      return 'http://localhost:8888/login';
    }
    return 'https://heroku-auth-server.herokuapp.com/login';
  }

  render() {
    const { environment } = this.state;
    if (!environment) { return <p>Loading...</p>; }
    return (
      <div className="Login">
        <a className="loginLink" href={environment}>
          Login With Spotify
        </a>
      </div>
    );
  }
}

export default Login;
