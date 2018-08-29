import React, {Component} from 'react'

class ListView extends Component {
  render() {
    return(
      <div className="listview">
        <h3>Places of Interest</h3>
        <div>
          <input className="search" type="text" placeholder="Filter by name"></input>
          <ul className="list">
          {
            this.props.venues.map(venue => (
              <li key={venue.id} className="list-item"><a href="" >{venue.name}</a></li>
            ))
          }
          </ul>
        </div>
      </div>
    )
  }
}

export default ListView