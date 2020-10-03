import React, { Component } from 'react';
import Spotify from 'spotify-web-api-js';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';

import './App.css';
import Login from './components/login/Login';
import ErrorPage from './ErrorPage';
import TopTracks from './components/top-tracks/TopTracks';
import NowPlaying from './components/now-playing/NowPlaying';
import TopArtists from './components/top-artists/TopArtists';
import Welcome from './components/welcome/Welcome';
import FrequentlyAskedQuestions from './components/faq/FrequentlyAskedQuestions';
import getHashParams from './hash';

import { logMessage } from './helpers/ConsoleOutput';

const spotifyWebApi = new Spotify();

class App extends Component {
  constructor() {
    super();
    const params = getHashParams();
    this.state = {
      loggedIn: !!params.access_token,
      dataLoaded: false,
    };
    if (params.access_token) {
      spotifyWebApi.setAccessToken(params.access_token);
    }
  }

  componentDidMount() {
    spotifyWebApi.getMe()
      .then((response) => {
        this.setState({
          userDetails: response,
          dataLoaded: true,
        });
        logMessage(response);
      });
  }

  // NOTE: this will need to be changed when the authorization work is sorted
  // there is a /logout endpoint on the server side which will redirect to the spotify log out page,
  // but we still need to be able to redirect back to our login page when that request has been made
  logOut() {
    this.url = window.location.href;
    if (this.url.includes('localhost')) {
      window.location.replace('http://localhost:3000/');
    } else {
      window.location.replace('https://visualise-spotify.herokuapp.com/');
    }
  }

  handleTabClick(eventKey) {
    if (eventKey === 'logOut') {
      this.logOut();
    }
  }

  render() {
    const { loggedIn, dataLoaded, userDetails } = this.state;
    const { id } = userDetails;
    if (!loggedIn) {
      return (
        <div className="App">
          <Login spotifyWebApi={spotifyWebApi} />
        </div>
      );
    }
    if (!dataLoaded) {
      return (
        <ErrorPage logOut={this.logOut} />
      );
    }

    return (
      <div className="App col">
        <Tabs defaultActiveKey="home" id="main-app-tabs" className="tabs" onSelect={(k) => this.handleTabClick(k)}>
          <Tab eventKey="home" title="Welcome!">
            <Welcome userDetails={userDetails} />
          </Tab>
          <Tab eventKey="topArtists" title="Top Artists">
            <TopArtists userId={id} logOut={this.logOut} spotifyWebApi={spotifyWebApi} />
          </Tab>
          <Tab eventKey="topTracks" title="Top Tracks">
            <TopTracks userId={id} spotifyWebApi={spotifyWebApi} />
          </Tab>
          <Tab eventKey="faq" title="FAQ">
            <FrequentlyAskedQuestions />
          </Tab>
          <Tab className="logOut" eventKey="logOut" title="Log out" onClick={this.logOut} />
        </Tabs>
        <div className="footer">
          <NowPlaying spotifyWebApi={spotifyWebApi} />
          <div>
            Icons made by
            <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a>
            {' '}
            from
            <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
