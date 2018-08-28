import React, { Component } from 'react';
import scriptLoader from 'react-async-script-loader'
import './App.css';
import ListView from './components/ListView'
import { GoogleMapKey } from './apiKey/GoogleKey'
class App extends Component {

  state = {
    map: {},
    bounds: {},
    infoWindow: {},
    mapError: false,
    // Data for map
    mapCenter: {lat: 60.170567, lng: 24.940657},
    mapZoom: 13,
    mapTypeControl: false
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
  
  // 
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

  render() {
    return (
      <div className="container">
        <div className="title">
          <h1>City of <span>Helsinki</span></h1>
          <p>A list of favorite places</p>
        </div>
        <div className="content">
          <ListView/>
          <div id='map' role='application'>
            {this.state.mapError &&
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
  `https://maps.googleapis.com/maps/api/js?&v=3&callback=initMap`
  // `https://maps.googleapis.com/maps/api/js?key=${GoogleMapKey}&v=3`
])(App)
