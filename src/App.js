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

  // Get Venues data then setup the map
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
          // Setup the map
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

  render() {
    const foursquareError = this.state.foursquareError
    const query = this.state.query
    const mapError = this.state.mapError
    const filterVenues = this.state.filterVenues
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
            <ul className="list">
              {filterVenues.map(venue =>
                <ListView venue={venue}/>
              )}
            </ul>
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
  `https://maps.googleapis.com/maps/api/js?key=${GoogleMapKey}&v=3`
])(App)



