import React, { Component } from 'react';
import './TopTracks.css';
import TopTracksHeader from './TopTracksHeader';
import TopTracksSongList from './TopTracksSongList';
import TopTracksIndividualSong from './TopTracksIndividualSong';
import { chartColours } from '../../helpers/PopularityChartHelper';

class TopTracks extends Component {
  constructor() {
    super();
    this.state = {
      topTracks: [],
      focusedSong: 0,
      numberOfSongs: 10,
      timeframe: 'medium_term',
      titleTimeframe: 'The Last 6 Months',
      popularityChart: {
        datasets: [
          {
            data: [],
            backgroundColor: ['#0074D9'],
          },
        ],
      },
      isLoaded: true,
    };
  }

  componentDidMount() {
    const { spotifyWebApi } = this.props;
    this.getTopTracks(spotifyWebApi);
  }

  /**
   * Grabs the most popular songs of the user (depending on the timeframe) and pushes them into an array.
   * The 'topTracks' state is then updated to add this new array.
   */
  getTopTracks(spotifyWebApi) {
    let tracks = [];
    const popularity = [];
    const labels = [];
    const { numberOfSongs, timeframe, focusedSong } = this.state;
    spotifyWebApi.getMyTopTracks({ limit: numberOfSongs, time_range: timeframe }).then((response) => {
      tracks = response.items;
      tracks.forEach((track) => {
        popularity.push(track.popularity);
        labels.push(track.name);
      });
      this.setState({
        topTracks: tracks,
        popularityChart: {
          labels,
          datasets: [
            {
              data: popularity,
              backgroundColor: chartColours(focusedSong),
            },
          ],
        },
        isLoaded: true,
      });
    });
  }

  /**
   * Get the popularity of a specific song and update the 'popularityChart' state.
   */
  getSongPopularity(popularity) {
    this.setState({
      popularityChart: {
        datasets: [
          {
            data: [popularity, 100 - popularity],
          },
        ],
      },
    });
  }

  /**
   * This function is used to select the song to view.
   */
  selectSong(track) {
    const { topTracks } = this.state;
    const { spotifyWebApi } = this.props;
    this.setState({
      focusedSong: topTracks.indexOf(track),
    });
    this.getTopTracks(spotifyWebApi);
  }

  /**
   * Sets the number of songs that the user wishes to see.
   */
  selectNumberOfSongs(numberOfSongs) {
    const { spotifyWebApi } = this.props;
    this.setState({
      numberOfSongs,
      focusedSong: 0,
    },
    () => {
      this.getTopTracks(spotifyWebApi);
    });
  }

  handleListClickEvent(index) {
    const { spotifyWebApi } = this.props;
    this.setState({
      focusedSong: index,
    });
    this.getTopTracks(spotifyWebApi);
  }

  /**
   * Select the timeframe for the user's top tracks.
   * 'short_term' = Top Tracks of The Last 1 Month.
   * 'medium_term' = Top Tracks of The Last 6 Months.
   * 'long_term' = Top Tracks of All Time.
   */
  selectTimeframe(timeframe) {
    const { spotifyWebApi } = this.props;
    switch (timeframe) {
      case 'short_term':
        this.setState({
          isLoaded: false,
          titleTimeframe: 'The Last Month',
          timeframe,
        },
        () => {
          this.getTopTracks(spotifyWebApi);
        });

        break;
      case 'medium_term':
        this.setState({
          isLoaded: false,
          titleTimeframe: 'The Last 6 Months',
          timeframe,
        },
        () => {
          this.getTopTracks(spotifyWebApi);
        });

        break;
      case 'long_term':
        this.setState({
          isLoaded: false,
          titleTimeframe: 'All Time',
          timeframe,
        },
        () => {
          this.getTopTracks(spotifyWebApi);
        });

        break;
      default:
    }
  }

  render() {
    const {
      topTracks, titleTimeframe, numberOfSongs, isLoaded, focusedSong, popularityChart,
    } = this.state;
    const { userId, spotifyWebApi } = this.props;
    return (
      <div className="App">
        <TopTracksHeader
          spotifyWebApi={spotifyWebApi}
          topTracks={topTracks}
          userId={userId}
          selectTimeframe={this.selectTimeframe}
          titleTimeframe={titleTimeframe}
          numberOfSongs={numberOfSongs}
          selectNumberOfSongs={this.selectNumberOfSongs}
          isLoaded={isLoaded}
        />
        <div className="row reverse-for-mobile margin-bottom margin-top">
          <TopTracksSongList
            topTracks={topTracks}
            selectSong={this.selectSong}
            focusedSong={focusedSong}
          />
          <TopTracksIndividualSong
            topTracks={topTracks}
            focusedSong={focusedSong}
            popularityChart={popularityChart}
            selectTimeframe={this.selectTimeframe}
            titleTimeframe={titleTimeframe}
            numberOfSongs={numberOfSongs}
            selectNumberOfSongs={this.selectNumberOfSongs}
            handleListClickEvent={this.handleListClickEvent}
          />
        </div>
      </div>
    );
  }
}

export default TopTracks;
