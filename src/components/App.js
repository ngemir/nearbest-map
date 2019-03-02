import React, { Component } from "react";
import scriptLoader from "react-async-script-loader";
import { MAP_KEY } from "../keys/keys";
import { mapStyles } from "../api/mapStyles.js";
import List from "./List";
import loader from "../images/loader.gif";
import foursquare from "../images/foursquare.png";

class App extends Component {
  state = {
    listOpen: true,
    map: {},
    infowindow: {},
    bounds: {},
    mapReady: false,
    // for future use when add location search
    mapCenter: { lat: -23.586026, lng: -46.682129 },
    mapError: false,
    width: window.innerWidth
  };

  componentDidMount() {
    window.addEventListener("resize", this.updateWidth);

    // If there's a error on google map
    window.gm_authFailure = () => {
      this.setState({ mapError: true });
    };
  }

  componentWillReceiveProps({ isScriptLoadSucceed }) {
    // Check if script is loaded and if map is defined
    if (isScriptLoadSucceed && !this.state.mapReady) {
      // create map
      const map = new window.google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: this.state.mapCenter,
        styles: mapStyles
      });

      // set up bounds and infowindow to use later
      const bounds = new window.google.maps.LatLngBounds();
      const infowindow = new window.google.maps.InfoWindow({ maxWidth: 300 });

      this.setState({
        map: map,
        infowindow: infowindow,
        bounds: bounds,
        mapReady: true
      });

      // alert user if map request fails
    } else if (!this.state.mapReady) {
      this.setState({ mapError: true });
    }
  }

  toggleList = () => {
    const { width, listOpen, infowindow } = this.state;

    if (width < 600) {
      // close infowindow if listview is opening
      if (!listOpen) {
        infowindow.close();
      }
      this.setState({ listOpen: !listOpen });
    }
  };

  updateWidth = () => {
    const { map, bounds } = this.state;
    this.setState({ width: window.innerWidth });
    if (map && bounds) {
      map.fitBounds(bounds);
    }
  };

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWidth);
  }

  render() {
    const { listOpen, map, infowindow, bounds, mapReady, mapCenter, mapError } = this.state;

    return (
      <div className="container" role="main">
        <header className="app-title">NearBest</header>
        <section
          id="restaurant-list"
          className={listOpen ? "list open" : "list"}
          role="complementary"
          tabIndex={listOpen ? "0" : "-1"}
        >
          
          <div class="button" tabindex="0">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </div>
          <div id="list-content">
            <img
              src={foursquare}
              alt="Powered by Foursquare"
              className="foursquare-logo"
            />
            {/* render markers only when map has loaded */
            mapReady ? (
              <List
                map={map}
                infowindow={infowindow}
                bounds={bounds}
                mapCenter={mapCenter}
                toggleList={this.toggleList}
                listOpen={listOpen}
              />
            ) : (
              <p>
                Something is worng. Please check your internet connection
              </p>
            )}
          </div>
        </section>
        
        <section id="map" className="map" role="application">
          {mapError ? (
            <div id="map-error" className="error" role="alert">
              Oops, something is wrong... Please come back later...
            </div>
          ) : (
            <div className="loading-map">
              <h4 className="loading-text">Loading...</h4>
              <img src={loader} className="loader" alt="loading" />
            </div>
          )}
        </section>
      </div>
    );
  }
}

export default scriptLoader([
  `https://maps.googleapis.com/maps/api/js?key=${MAP_KEY}`
])(App);
