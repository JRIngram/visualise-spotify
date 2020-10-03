import React, { Component } from 'react';
import TopArtistsList from './TopArtistsList';
import TopArtistDetails from './TopArtistDetails';
import TopArtistsHeader from './TopArtistsHeader';
import SuccessModal from '../modals/SuccessModal';
import ErrorModal from '../modals/ErrorModal';
import ErrorPage from '../../ErrorPage';
import { getCurrentDate } from '../../helpers/DateHelper';
import { chartColours } from '../../helpers/PopularityChartHelper';
import { uploadPlaylistImage, meet100TrackLimit, getTopTracksForArtists } from '../../helpers/PlaylistHelper';
import { logError } from '../../helpers/ConsoleOutput';
import './TopArtists.css';

// Set the amount of similar artists to be displayed (MAX=20)
const similarArtistsReturnLimit = 20;

/**
 * Responsible for getting data for TopArtistDetails and TopArtistsLists
 * TODO: add better error handling, tests and general tidy-up, use success/error modals after promises are returned
 * */
class TopArtists extends Component {
  constructor() {
    super();
    this.state = {
      // List of top artists, used in TopArtistsList
      topArtists: [],
      // One song from each top artist, used for song preview in TopArtistDetails
      topArtistsTracks: [],
      timeRange: 'medium_term',
      selectedArtist: 0,
      similarToSelectedArtist: [],
      dataHasLoaded: false,
      isFollowingArtist: false,
      resultLimit: 20,
      // Full set of popularit data for all artists
      popularityChartData: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: ['#0074D9'],
          },
        ],
      },
    };
  }

  componentDidMount() {
    this.getAllData();
  }

  getAllData() {
    // Need to get top artists before finding the top track for each artist
    this.getTopArtists(this.state.resultLimit).then((topArtists) => {
      const popularity = [];
      const labels = [];
      topArtists.forEach((artist) => {
        popularity.push(artist.popularity);
        labels.push(artist.name);
      });

      getTopTracksForArtists(topArtists, 1, this.props.spotifyWebApi)
        .then((topTracks) => {
          this.setState({
            topArtists,
            topArtistsTracks: topTracks,
            popularityChartData: {
              labels,
              datasets: [
                {
                  data: popularity,
                  backgroundColor: chartColours(this.state.selectedArtist),
                }],
            },
            dataHasLoaded: true,
          }, () => {
            // Get additional data with an artistId for the first artist in the list
            this.getSimilarArtists(similarArtistsReturnLimit, this.state.topArtists[0].id);
          });
        })
        .catch((err) => {
          logError(err);
        });
    });
  }

  // Get x top artists for this user
  getTopArtists(numOfTopArtists) {
    return new Promise((resolve) => {
      this.props.spotifyWebApi.getMyTopArtists({ time_range: this.state.timeRange, limit: numOfTopArtists })
        .then((response) => resolve(response.items))
        .catch((err) => {
          logError(err);
        });
    });
  }

  // Get similar artists to the currently selected artist
  getSimilarArtists(limit, artistId) {
    this.props.spotifyWebApi.getArtistRelatedArtists(artistId)
      .then((response) => {
        const similarArtists = response.artists.slice(0, limit);
        this.setState({
          similarToSelectedArtist: similarArtists,
          dataHasLoaded: true,
        });
      })
      .catch((err) => {
        logError(err);
      });
  }

  // Spotify API returns data for long/medium/short term
  getTimeRangeInString() {
    switch (this.state.timeRange) {
      case 'long_term':
        return 'All Time';
      case 'medium_term':
        return 'The Last 6 Months';
      case 'short_term':
        return 'The Past Month';
      default:
        return 'INVALID TIME RANGE';
    }
  }

  setTimeRange(newTimeRange) {
    this.setState({
      timeRange: newTimeRange,
    }, () => {
      this.getAllData();
    });
  }

  setResultLimit(newResultLimit) {
    this.setState({
      resultLimit: newResultLimit,
    }, () => {
      this.getAllData();
    });
  }

  getSuccessDescription() {
    return `A playlist with songs by your top ${this.state.resultLimit} artists ${this.getTimeRangeInString()} has been created! Check your Spotify!`;
  }

  getErrorDescription() {
    return `There was an error making your playlist, please try again! If this error continues, please contact Clare or Thavi for help :)`;
  }

  // Check whether the user is following a given artist
  isFollowingArtist(artistId) {
    this.props.spotifyWebApi.isFollowingArtists([artistId])
      .then((response) => {
        this.setState({
          isFollowingArtist: response[0],
          dataHasLoaded: true,
        });
      })
      .catch((err) => {
        logError(err);
      });
  }

  // Creates a new playlist for top artist songs
  createNewPlaylist(numOfSongs) {
    const playlistName = `Songs by my Top ${this.state.resultLimit} Artists ${this.getTimeRangeInString()}`;
    const playlistDescription = `Top ${numOfSongs} song(s) by my ${this.state.resultLimit} top artists ${this.getTimeRangeInString()} as of ${getCurrentDate()}`;

    this.props.spotifyWebApi.createPlaylist(this.props.userId, { name: playlistName, description: playlistDescription })
      .then((response) => {
        this.populatePlaylist(response.id, numOfSongs);
        uploadPlaylistImage(this.props.spotifyWebApi, response.id, 'top-artists-playlist-cover.jpeg');
        // TODO >>> SUCCESS DIALOG AFTER EVERYTHING'S LOADED
      })
      .catch((err) => {
        logError(err);
      });
  }

  // Populates the given playlist with songs by top artists
  populatePlaylist(playlistId, numOfSongs) {
    getTopTracksForArtists(this.state.topArtists, numOfSongs, this.props.spotifyWebApi)
      .then((tracks) => {
        tracks = tracks.flat(1);
        const trackUris = [];
        for (const track of tracks) {
          trackUris.push(track.uri);
        }
        if (trackUris.length > 100) {
          const fullPlaylists = meet100TrackLimit(trackUris);
          for (const fullPlaylist of fullPlaylists) {
            this.props.spotifyWebApi.addTracksToPlaylist(playlistId, fullPlaylist)
              .catch((err) => {
                logError(err);
              });
          }
        } else {
          this.props.spotifyWebApi.addTracksToPlaylist(playlistId, trackUris)
            .catch((err) => {
              logError(err);
            });
        }
      })
      .catch((err) => {
        logError(err);
      });
  }

  // Helper function to set whether the data has been loaded
  setDataHasLoaded(hasLoaded) {
    this.setState({
      dataHasLoaded: hasLoaded,
    });
  }

  // Need to load additional data for a given artist
  handleListClickEvent(index) {
    const { popularityChartData, topArtists } = this.state;
    this.setState({
      selectedArtist: index,
      popularityChartData: {
        labels: popularityChartData.labels,
        datasets: [
          {
            data: popularityChartData.datasets[0].data,
            backgroundColor: chartColours(index),
          }],
      },
      dataHasLoaded: false,
    });
    this.getSimilarArtists(similarArtistsReturnLimit, topArtists[index].id);
    this.isFollowingArtist(topArtists[index].id);
  }

  render() {
    const {
      dataHasLoaded, resultLimit, selectedArtist, topArtists, topArtistsTracks,
      similarToSelectedArtist, isFollowingArtist, artistsPopularity, popularityChartData,
    } = this.state;
    const {
      logOut, spotifyWebApi, userId,
    } = this.props;

    if (!dataHasLoaded) {
      return (
        <div>
          <p>Loading data...</p>
          <ErrorPage logOut={logOut} />
        </div>

      );
    }

    return (
      <div className="TopArtists">
        <SuccessModal descriptionText={this.getSuccessDescription()} />
        <ErrorModal descriptionText={this.getErrorDescription()} />

        <TopArtistsHeader
          setTimeRange={this.setTimeRange}
          titleTimeframe={this.getTimeRangeInString()}
          resultLimit={resultLimit}
          setResultLimit={this.setResultLimit}
          isLoaded={dataHasLoaded}
          createNewPlaylist={this.createNewPlaylist}
        />

        <div className="mainContent row justify-content-around">
          <TopArtistsList
            className="col-sm-4"
            selectedArtist={selectedArtist}
            topArtists={topArtists}
            handleListClickEvent={this.handleListClickEvent}
          />
          <TopArtistDetails
            className="col-sm-8"
            spotifyWebApi={spotifyWebApi}
            artistImage={topArtists[selectedArtist].images[0].url}
            artistName={topArtists[selectedArtist].name}
            artistId={topArtists[selectedArtist].id}
            followers={topArtists[selectedArtist].followers.total}
            genres={topArtists[selectedArtist].genres}
            similarArtists={similarToSelectedArtist}
            isFollowingArtist={isFollowingArtist}
            checkFollowingArtist={this.isFollowingArtist}
            previewUrl={topArtistsTracks[selectedArtist].preview_url}
            artistPopularity={topArtists[selectedArtist].popularity}
            artistsPopularity={artistsPopularity}
            getTimeRangeInString={this.getTimeRangeInString}
            userId={userId}
            numOfArtists={resultLimit}
            popularityChartData={popularityChartData}
            handleListClickEvent={this.handleListClickEvent}
          />
        </div>
      </div>
    );
  }
}

export default TopArtists;
