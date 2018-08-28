import React, {Component} from 'react'

class ListView extends Component {
  render() {
    return(
      <div className="listview">
        <h3>Places of Interest</h3>
        <div>
          <input className="search" type="text" placeholder="Filter by name"></input>
          <ul className="list">
            <li><a href="" className="list-item">Starbuck 1</a></li>
            <li><a href="" className="list-item">Starbuck 2</a></li>
            <li><a href="" className="list-item">Starbuck 3</a></li>
            <li><a href="" className="list-item">Starbuck 4</a></li>
            <li><a href="" className="list-item">Starbuck 5</a></li>
            <li><a href="" className="list-item">Starbuck 6</a></li>
            <li><a href="" className="list-item">Starbuck 7</a></li>
            <li><a href="" className="list-item">Starbuck 8</a></li>
          </ul>
        </div>
      </div>
    )
  }
}

export default ListView