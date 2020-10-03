import React, { Component } from 'react';
import { getCurrentDate } from '../../helpers/DateHelper';
import { uploadPlaylistImage } from '../../helpers/PlaylistHelper';
import TimeframeDropdown from '../dropdown-options/TimeframeDropdown';
import NumberOfResultsDropdown from '../dropdown-options/NumberOfResultsDropdown';

/**
 * Responsible for telling the user the number of songs within a given timeframe.
 * Also responsible for creating a playlist of the songs.
 * */
class TopTracksHeader extends Component {
  constructor() {
    super();
    this.state = {
      playlistCreatedText: '',
    };
  }

  /**
     * Creates a new Spotify playlist of top tracks for the user given their parameters
     */
  createNewPlaylist(spotifyWebApi) {
    const {
      numberOfSongs, titleTimeframe, userId, topTracks,
    } = this.props;
    const songUriList = [];
    const playlistName = `My Top ${numberOfSongs} Songs of ${titleTimeframe}`;
    const playlistDescription = `These are your Top ${numberOfSongs} Songs of ${titleTimeframe} as of ${getCurrentDate()}`;
    spotifyWebApi.createPlaylist(userId, { name: playlistName, description: playlistDescription }).then((response) => {
      for (let i = 0; i < numberOfSongs; i += 1) {
        songUriList.push(topTracks[i].uri);
      }
      spotifyWebApi.addTracksToPlaylist(response.id, songUriList);
      uploadPlaylistImage(spotifyWebApi, response.id, '/top-tracks-playlist-cover.jpg');
      this.setState({
        playlistCreatedText: `A playlist with your Top ${numberOfSongs} songs of ${titleTimeframe} has been created! Check your Spotify!`,
      });
    });
  }

  render() {
    const {
      numberOfSongs, titleTimeframe, selectNumberOfSongs, selectTimeframe, isLoaded, spotifyWebApi,
    } = this.props;
    const { playlistCreatedText } = this.state;

    return (
      <div className="header">
        <div className="row col-lg-12 offset-lg-4">
          <p>Your Top</p>
          <div className="margin-right margin-left">
            <NumberOfResultsDropdown
              numberOfResults={numberOfSongs}
              selectNumberOfResults={selectNumberOfSongs}
            />
          </div>
          <p>Songs of</p>
          <div className="margin-right margin-left">
            <TimeframeDropdown
              selectTimeframe={selectTimeframe}
              titleTimeframe={titleTimeframe}
              isLoaded={isLoaded}
            />
          </div>
        </div>
        <button type="button" className="btn btn-success" onClick={() => { this.createNewPlaylist(spotifyWebApi); }} data-toggle="modal" data-target="#myModal">
          Add These Songs To Playlist
        </button>
        <div id="myModal" className="modal fade" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal">&times;</button>
              </div>
              <div className="modal-body">
                <p className="popup-text">{playlistCreatedText}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default TopTracksHeader;
