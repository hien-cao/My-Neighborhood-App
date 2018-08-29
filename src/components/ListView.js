import React from 'react'
import PropTypes from 'prop-types'


class ListView extends React.Component {
  static propTypes = {
    venue: PropTypes.object.isRequired
  }

  showInfoWindow = () => {
    // Simulate a click on marker
    window.google.maps.event.trigger(this.props.venue.marker,'click');
  }

  render() {
    const venue = this.props.venue
    return (
      <li key={venue.id} className="list-item"><p href='' onClick={this.showInfoWindow} onKeyPress={this.showInfoWindow} role='button' tabIndex='0'>{venue.name}</p></li>
    )
  }
}

export default ListView