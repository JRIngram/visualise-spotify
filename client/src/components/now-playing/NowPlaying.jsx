import React, { Component } from 'react';
import './NowPlaying.css';
import { logMessage } from '../../helpers/ConsoleOutput';

class NowPlaying extends Component {
  constructor() {
    super();
    this.state = {
      nowPlaying: {
        name: 'Not Checked',
        artists: null,
        image: null,
      },
      showNowPlaying: false,
      hideWholeBanner: true, // change to false when spotify api is in stable state
      spotifyIsPlaying: true,
    };
  }

  getNowPlaying(spotifyWebApi) {
    spotifyWebApi.getMyCurrentPlaybackState().then((response) => {
      logMessage(response);
      if (response.item == null) {
        this.setState({
          spotifyIsPlaying: false,
        });
      } else {
        this.setState({
          nowPlaying: {
            name: response.item.name,
            artists: response.item.artists[0].name,
            image: response.item.album.images[0].url,
          },
          showNowPlaying: true,
        });
      }
    });
  }

  skipToNext() {
    const { spotifyWebApi } = this.props;
    spotifyWebApi.skipToNext().then((response) => {
      logMessage(response);
    });
  }

  hideComponent() {
    this.setState({
      showNowPlaying: false,
      hideWholeBanner: true,
    });
  }

  render() {
    const {
      hideWholeBanner, spotifyIsPlaying, showNowPlaying, nowPlaying,
    } = this.state;
    const { name, image } = nowPlaying;
    if (hideWholeBanner) {
      return null;
    }
    if (!spotifyIsPlaying) {
      return (
        <p> something</p>
      );
    }
    if (!showNowPlaying) {
      return (
        <div className="NowPlaying row justify-content-md-center">
          <div className="genericButton" onClick={() => this.getNowPlaying(this.props.spotifyWebApi)}>Show media player</div>
          <div className="genericButton" onClick={this.hideComponent}>Hide</div>
        </div>
      );
    }

    return (
      <div className="NowPlaying">
        <div>
          Now Playing:
          {name}
        </div>
        <div>
          <img src={image} alt="" style={{ width: 100 }} />
        </div>
        <div onClick={() => this.skipToNext()} role="button" onKeyUp={(() => this.skipToNext())} tabIndex="0">Skip</div>
      </div>
    );
  }
}

export default NowPlaying;
