import React, { Component } from 'react';
import scriptLoader from 'react-async-script-loader'
import axios from 'axios'
import ListView from './components/ListView'
import { Venues } from './components/Venues'
import { GoogleMapKey } from './apiKey/GoogleKey'
import { ClientID, ClientSecret } from './apiKey/FoursquareKey'
import './App.css';
class App extends Component {

  state = {
    map: {},
    bounds: {},
    infoWindow: {},
    mapError: false,
    foursquareError: false,
    // Data for map
    mapCenter: {lat: 60.170567, lng: 24.940657},
    mapZoom: 13,
    mapTypeControl: false,
    // List of venues (locations)
    venues: []
  }

  componentDidMount() {
    this.getVenues()
  }

  componentWillReceiveProps({isScriptLoadSucceed}) {
    // Google map script load successfully
    if(isScriptLoadSucceed) {
      this.initMap();
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
    // Create Google map bounds
    const bounds = new window.google.maps.LatLngBounds();
    // Create Google map infowindow
    const infoWindow = new window.google.maps.InfoWindow();

    this.setState({
      map: map,
      bounds: bounds,
      infoWindow: infoWindow
    })
  }

  // Get list of venues (locations) from Foursquare
  getVenues = () => {
    for (let venueid of Venues) {
      const url = `https://api.foursquare.com/v2/venues/${venueid.venueid}?client_id=${ClientID}&client_secret=${ClientSecret}&v=20180828`
      axios.get(url)
        .then(response => {
          this.setState(state => ({
            venues: [...state.venues,response.data.response]
          }))
        })
        .catch(error => {
          console.log('Error! ' + error)
          this.setState({
            foursquareError: true
          })
        })
    }
  }

  render() {
    const {map, bounds, infoWindow, mapError, foursquareError, mapCenter, mapZoom, mapTypeControl, venues} = this.state

    return (
      <div className="container" role="main">
        <div className="title" tabIndex="0">
          <h1>City of <span>Helsinki</span></h1>
          <p>A list of favorite places</p>
        </div>
        <div className="content">
          {!foursquareError ? <ListView 
            map={map}
            bounds={bounds}
            infoWindow={infoWindow}
            venues={venues.map(e => e.venue)}
          /> : <div className="listview">
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
