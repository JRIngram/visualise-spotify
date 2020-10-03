import { Buffer } from 'safer-buffer';
import { logMessage } from './ConsoleOutput';

const express = require('express');
const request = require('request');
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const config = require('./config.json');

const safeBuffer = Buffer;
const app = express();

app.use(express.static(`${__dirname}/public`))
  .use(cors())
  .use(cookieParser());

const getEnvironment = () => {
  if (process.env.PORT === null || process.env.PORT === '') {
    return 'http://localhost:3000';
  }
  return 'https://visualise-spotify.herokuapp.com';
};

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = (length) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

app.get('/', (req, res) => {
  res.send('Server is working correctly');
});

app.get('/login', (req, res) => {
  const state = generateRandomString(16);
  res.cookie(config.state_key, state);

  res.redirect(`https://accounts.spotify.com/authorize?${
    querystring.stringify({
      response_type: 'code',
      client_id: config.client_id,
      scope: config.scope,
      redirect_uri: config.redirect_uri,
      state,
      show_dialog: true,
    })}`);
});

app.get('/logout', (req, res) => {
  res.redirect('https://accounts.spotify.com/en/logout');
});

app.get('/callback', (req, res) => {
  // requests refresh and access tokens after checking the state parameter
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[config.state_key] : null;
  if (state === null || state !== storedState) {
    res.redirect(`/#${
      querystring.stringify({
        error: 'state_mismatch',
      })}`);
  } else {
    res.clearCookie(config.state_key);
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code,
        redirect_uri: config.redirect_uri,
        grant_type: 'authorization_code',
      },
      headers: {
        Authorization: `Basic ${safeBuffer(`${config.client_id}:${config.client_secret}`).toString('base64')}`,
      },
      json: true,
    };

    // make the request
    request.post(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        /* eslint-disable */
        // Disable linter as non-camel-case variables come from body
        const { access_token } = body;
        const { refresh_token } = body;

        const options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { Authorization: `Bearer ${access_token}` },
          json: true,
        };
        /* eslint-enable */

        // use the access token to access the Spotify Web API
        request.get(options, () => {
          logMessage(body);
        });

        // pass the token to the browser to make requests from there
        res.redirect(`${getEnvironment()}#${
          querystring.stringify({
            access_token,
            refresh_token,
          })}`);
      } else {
        res.redirect(`/#${
          querystring.stringify({
            error: 'invalid_token',
          })}`);
      }
    });
  }
});

app.get('/refresh_token', (req, res) => {
  // requesting access token from refresh token
  /* eslint-disable */
  // Disable linter as non-camel-case variables come from body
  const { refresh_token } = req.query;
  /* eslint-enable */
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { Authorization: `Basic ${safeBuffer(`${config.client_id}:${config.client_secret}`).toString('base64')}` },
    form: {
      grant_type: 'refresh_token',
      refresh_token,
    },
    json: true,
  };

  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      /* eslint-disable */
      // Disable linter as non-camel-case variables come from body
      const { access_token } = body;
      /* eslint-enable */
      res.send({
        access_token,
      });
    }
  });
});

let port = process.env.PORT;
if (port == null || port === '') {
  port = 8888;
}
logMessage(`Listening on ${port}`);
app.listen(process.env.PORT || 8888, () => {
  logMessage('Express server listening on port %d in %s mode', this.address().port, app.settings.env);
});
