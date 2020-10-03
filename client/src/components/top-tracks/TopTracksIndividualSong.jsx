import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import { Spring } from 'react-spring/renderprops';
import { playOrPausePreview } from '../../helpers/TrackPreviewHelper';
import { calculateAveragePopularity, generateTextForAveragePopularity } from '../../helpers/PopularityChartHelper';

/**
 * Responsible for displaying an individual track that the user selected.
 * Also gets the popularity of that track and displays it as a pie chart over the album art.
 * */
class TopTracksIndividualSong extends Component {
  // Clicking on a bar will take the user to view that artist
  handleClick(mouseEvent, chartElement) {
    const element = chartElement[0];
    const { handleListClickEvent } = this.props;
    if (element) {
      handleListClickEvent(element._index); // eslint-disable-line
    }
  }

  render() {
    const {
      topTracks, focusedSong, popularityChart, numberOfSongs,
    } = this.props;
    return (
      <div className="col-lg-8">
        {topTracks.slice(focusedSong, focusedSong + 1).map((track) => (
          <div key={track.id} className="row">
            <Spring
              from={{ opacity: 0, marginTop: -500 }}
              to={{ opacity: 1, marginTop: 0 }}
            >
              {(props) => (
                <div style={props} className="col-lg-4">
                  <a href={track.album.external_urls.spotify} target="_blank"><img className="img-responsive album-art center-image" src={track.album.images[0].url} alt="" /></a>
                </div>
              )}
            </Spring>
            <Spring
              from={{ opacity: 0 }}
              to={{ opacity: 1 }}
            >
              {(props) => (
                <div style={props} className="col-md-8">
                  <div className="song-text-container">
                    <h3><a href={track.external_urls.spotify} className="top-tracks-song-info" target="_blank">{track.name}</a></h3>
                    <div>
                      {track.artists.map((artist) => (
                        <h6 key={artist.id}><a href={artist.external_urls.spotify} className="top-tracks-song-info" target="_blank">{`${artist.name}`}</a></h6>
                      ))}
                    </div>
                    <i className="fas fa-compact-disc" />
                    <h6><a href={track.album.external_urls.spotify} className="top-tracks-song-info" target="_blank"><b>{track.album.name}</b></a></h6>
                    <audio id="song-preview">
                      <source src={track.preview_url} type="audio/ogg" />
                    </audio>
                    <button className="play-btn" onClick={() => playOrPausePreview('song-preview')}>
                      <img alt="start/stop icon" className="play-pause" src="/pause-play-button.png" />
                    </button>
                  </div>
                </div>
              )}
            </Spring>
          </div>
        ))}
        <div className="margin-bottom col-lg-10 offset-lg-1">
          <Bar
            data={popularityChart}
            options={{
              scales: {
                yAxes: [{
                  ticks: {
                    beginAtZero: true,
                    fontColor: 'white',
                  },
                }],
                xAxes: [{
                  display: false,
                  ticks: {
                    fontColor: 'white',
                  },
                }],
              },
              title: {
                display: true,
                text: 'Popularity of these Songs',
                fontSize: 16,
                fontColor: '#ffffff',
              },
              legend: {
                display: false,
                position: 'right',
                labels: {
                  fontColor: 'white',
                },
              },
              tooltips: {
                callbacks: {
                  label(tooltipItem) {
                    return tooltipItem.yLabel;
                  },
                },
              },
              onClick: this.handleClick,
            }}
          />
        </div>
        <div className="col-lg-12 popularity-text-container">
          <div>
            The average popularity score for these songs is
            {' '}
            {calculateAveragePopularity(popularityChart.datasets[0].data, numberOfSongs)}
            /100!
          </div>
          <div>
            {generateTextForAveragePopularity(calculateAveragePopularity(popularityChart.datasets[0].data, numberOfSongs))}
          </div>
        </div>
      </div>
    );
  }
}

export default TopTracksIndividualSong;
