import React, { Component } from 'react';
import scriptLoader from 'react-async-script-loader'
import axios from 'axios'
import escapeStringRegexp from 'escape-string-regexp'
import sortBy from 'sort-by'
import ListView from './components/ListView'
import { Venues } from './components/Venues'
import { GoogleMapKey } from './apiKey/GoogleKey'
import { ClientID, ClientSecret } from './apiKey/FoursquareKey'
import './App.css';
class App extends Component {

  state = {
    map: {},
    // bounds: {},
    infoWindow: {},
    mapError: false,
    foursquareError: false,
    // Data for map
    mapCenter: {lat: 60.170567, lng: 24.940657},
    mapZoom: 13,
    mapTypeControl: false,
    // List of venues (locations)
    venues: [],
    filterVenues: [],
    query: ''
  }

  // componentDidMount() {
  //   this.getVenues()
  // }

  componentWillReceiveProps({isScriptLoadSucceed}) {
    // Google map script load successfully
    if(isScriptLoadSucceed) {
      this.getVenues()
    // Google map script load unsuccessfully
    } else { 
      this.setState({
        mapError: true
      })
    }
  }
  
  // Set up Google Map
  initMap = () => {
    // Create the Google map
    const map = new window.google.maps.Map(document.getElementById('map'), {
      center: this.state.mapCenter,
      zoom: this.state.mapZoom,
      mapTypeControl: this.state.mapTypeControl
    })
    // Add map to state
    this.setState({
      map: map,
    })
  }

  // Get list of venues (locations) from Foursquare
  getVenues = () => {
    for (let venueid of Venues) {
      const url = `https://api.foursquare.com/v2/venues/${venueid.venueid}?client_id=${ClientID}&client_secret=${ClientSecret}&v=20180828`
      axios.get(url)
        .then(response => {
          this.setState(state => ({
            venues: [...state.venues,response.data.response.venue],
            filterVenues: [...state.venues,response.data.response.venue].sort(sortBy('name'))
          }))
          this.initMap()
          // Add markers
          this.addMarkers(this.state.venues)
        })
        .catch(error => {
          console.log('Error! ' + error)
          this.setState({
            foursquareError: true
          })
        })
    }
    
  }
  // Filter the venues and add to filterVenues array
  filterVenues = evt => {
    const allVenues = this.state.venues
    const query = evt.target.value.trim()
    let filterVenues = []
    // Update the query in the state
    this.setState({
      query: query
    })
    // Close infowindow before filter
    this.state.infoWindow.close();
    // Filter the venues by the name of venues

    const match = new RegExp(escapeStringRegexp(query), 'i')
    filterVenues = allVenues.filter(venue => {
      const value = match.test(venue.name)
      // Filter the marker
      venue.marker.setVisible(value)
      return value
    })
    
    filterVenues.sort(sortBy('name'))
   

    // Update the showingVenues in the state
    this.setState({
      filterVenues: filterVenues
    })
  }

  // Add marker
  addMarkers = venues => {
    const map = this.state.map
    const bounds = new window.google.maps.LatLngBounds();
    const infoWindow = new window.google.maps.InfoWindow();
    venues.forEach(venue => {
      // Define data for marker & infowindow
      const position = {
        lat: venue.location.lat,
        lng: venue.location.lng
      }
      const name = venue.name
      const address = venue.location.address === "" || venue.location.address === undefined ? 'Data is unavailable' : venue.location.address
      const rating = venue.rating === "" || venue.rating === undefined ? 'Rating data is unavailable' : `The location is rated ${venue.rating}`
      const url = venue.canonicalUrl

      venue.marker = new window.google.maps.Marker({
        position: position,
        map: map,
        title: name,
        animation: window.google.maps.Animation.DROP,
        id: venue.id
      })
      venue.marker.addListener('click', () => {
        // this.populateInfoWindow(venue.marker, infoWindow)
        if (infoWindow.marker !== venue.marker) {
          infoWindow.marker = venue.marker;
          infoWindow.setContent(
            `
            <div class="venue">
              <h3>${name}</h3>
              <p>Address: ${address}</p>
              <p>${rating}</p>
              <a href="${url}" target="_blank">Read more from Foursquare</a>
            </div>
            `
          );
          infoWindow.open(this.state.map, venue.marker);
          // Make sure the marker property is cleared if the infowindow is closed.
          infoWindow.addListener('closeclick', () => {
            infoWindow.marker = null;
          });
        }
      })
      bounds.extend(position);
    })
    map.fitBounds(bounds);
    this.setState({
      infoWindow: infoWindow
    })
  }

  showInfo = (venue) => {
    window.google.maps.event.trigger(venue.marker,'click');
  }

  render() {
    const foursquareError = this.state.foursquareError
    const query = this.state.query
    const mapError = this.state.mapError
    return (
      <div className="container" role="main">
        <div className="title" tabIndex="0">
          <h1>City of <span>Helsinki</span></h1>
          <p>A list of favorite places</p>
        </div>
        <div className="content">
          {!foursquareError ? <div className="listview">
          <h3>Places of Interest</h3>
          <div>
            <input className="search" type="text" placeholder="Filter by name" value={query} onChange={this.filterVenues} role='search' aria-labelledby='Name filter' tabIndex='0'></input>
            <ListView venues={this.state.filterVenues} onShowInfo={this.showInfo}/>
          </div>
        </div> 
        : 
        <div className="listview">
            <h3>Error while loading Foursquare data. Please try again later!</h3>
          </div>}
          <div id='map' role='application'>
            {mapError &&
              <h2 className='error'>Map loading error!</h2>
            }
          </div>
        </div>
        <footer>Udacity - My Neighborhood App</footer>
      </div>
    );
  }
}

export default scriptLoader([
  // `https://maps.googleapis.com/maps/api/js?&v=3`
  `https://maps.googleapis.com/maps/api/js?key=${GoogleMapKey}&v=3`
])(App)







import React from 'react'
import PropTypes from 'prop-types'

function ListView(props) {
  return(
    <ul className="list">
    {
      props.venues.map(venue => (
        <li key={venue.id} className="list-item"><a href='' onClick={props.onShowInfo} onKeyPress={props.onShowInfo} role='button' tabIndex='0'>{venue.name}</a></li>
      ))
    }
    </ul>
  )
}

ListView.propTypes = {
  venues: PropTypes.array.isRequired,
  onShowInfo: PropTypes.func.isRequired
}

export default ListView





* {
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #ffffff;
  line-height: 1;
  padding: 1em;
  font-size: 16px
}

.container {
  max-width: 1350px;
  margin-left: auto;
  margin-right: auto;
  padding: 1em;
}

ul {
  list-style: none;
  padding: 0;
}

footer {
  background: #d2d5d6;
  padding: 1em;
  font-size: 0.8rem;
  text-align: center;
}
/* Title */
.title {
  text-align: center;
  background-color: #11ADDB;
  color: #485e74;
  padding: 0.1em;
  font-size: 0.8em;
}

.title h1 {
  text-transform: uppercase;
}

.title span {
  color: #ffffff;
}

/* Content */
.content {
  background: #92bde7;
  color: #485e74;
  font-size: 0.8em;
}

#map {
  width: 100%;
  min-height: 400px;
}

.listview {
  padding: 0.1em 1em;
  text-align: center;

}

.search {
  width: 100%;
  border-radius: 5px;
  padding: 0.5em;
  margin-bottom: 1px;
}

.listview .list {
  display: grid;
  grid-template-columns: 1fr;
  justify-items: center;
}

.listview .list a {
  background-color: #e6eeef ;
  text-align: center;
  width: auto;
  min-width: 18em;
  display: inline-block;
  transition-duration: 0.4s;
  list-style: none;
  border-radius: 5px;
  margin: 2px auto;
  padding: 10px 5px;
  text-decoration: none;
  font-size: 1em;
}

.listview .list a:hover {
  background-color: #d3d9da;
}

.listview .list a:active {
  color: green;
}

.venue {
  text-align: center;
}

.error {
  color: #ff0000;
  padding-top: 5rem;
  text-align: center;
}
/* Screen size 400px and up */
@media(min-width: 400px) {
  .listview .list a {
    min-width: 25em;
  }
}

/* Screen size 700px and up */
@media(min-width: 700px) {
  .title {
    font-size: 0.8rem;
  }
  .content {
    display: grid;
    grid-template-columns: 1fr 2fr;
    font-size: 1em
  }
  #map {
    width: 100%;
    min-height: 600px;
  }
  .search {
    margin-bottom: 1em;
    font-size: 1em;
  }
  .listview .list {
    display: inline;
    text-align: center;
  }
  .listview .list a {
    margin: 5px auto;
    width: 100%;
    min-width: 11em;
    font-size: 0.85em;
  }
}

/* Screen size 800px and up */
@media(min-width: 800px) {
  .listview .list a {
    font-size: 1em;
  }
}


/* Screen size 1070px and up */
@media(min-width: 1070px) {
  body {
    line-height: 1.2;
  }
  
  .content {
    display: grid;
    grid-template-columns: 1fr 3fr;
    /* font-size: 1.1em */
  }
}
