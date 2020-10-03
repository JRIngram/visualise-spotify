import React, { Component } from 'react';

/**
 * Responsible for rendering the list of top artists for this user
 * */
class TopArtistsList extends Component {
  // Need to load additional data for a given artist
  handleListClickEvent(index) {
    const { handleListClickEvent } = this.props;
    handleListClickEvent(index);
  }

  render() {
    const { topArtists, selectedArtist } = this.props;
    return (
      <div className="topArtistList">
        {topArtists.map((result, index) => (
          <li
            id={index}
            key={result.id}
            onClick={() => { this.handleListClickEvent(index); }}
            onKeyPress={() => { this.handleListClickEvent(index); }}
            className={selectedArtist === index ? 'selected' : 'result'}
            tabIndex={index}
            role="button"
          >
            <p>
              {index + 1}
              .
            </p>
            <div className="albumArtContainer">
              <img className="albumArt" src={result.images[0].url} alt="album art" />
            </div>
            <p>{result.name}</p>
          </li>
        ))}
      </div>
    );
  }
}

export default TopArtistsList;
