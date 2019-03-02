import React, { Component } from "react";
import Place from "./Place";
import { getFSLocations, getFSDetails } from "../api/foursquare";
import { checkData, buildInfoContent, buildErrorContent } from "../api/foursquare-info";
import markerIcon from "../images/marker.gif";
import loader from "../images/loader.gif";
import PropTypes from "prop-types";

class List extends Component {
  static propTypes = {
    map: PropTypes.object.isRequired,
    infowindow: PropTypes.object.isRequired,
    bounds: PropTypes.object.isRequired,
    mapCenter: PropTypes.object.isRequired,
    toggleList: PropTypes.func.isRequired,
    listOpen: PropTypes.bool.isRequired
  };

  state = {
    query: "",
    allPlaces: [],
    filteredPlaces: null,
    apiReturned: false,
    apiError: false
  };

  componentDidMount() {
    // get the foursquare locations and set new states with found places
    getFSLocations(this.props.mapCenter)
      .then(places => {
        this.setState({
          allPlaces: places,
          filteredPlaces: places,
          apiReturned: true
        });
        // add markers on found places
        if (places) this.addMarkers(places);
      })
      .catch(error => this.setState({ apiError: true }));
  }

  addMarkers(places) {
    const { map, bounds, infowindow, toggleList } = this.props;
    const self = this;

    places.forEach(location => {
      const position = {
        lat: location.location.lat,
        lng: location.location.lng
      };

      location.marker = new window.google.maps.Marker({
        position,
        map,
        title: location.name,
        id: location.id,
        icon: markerIcon
      });

      bounds.extend(position);

      location.marker.addListener("click", function() {
        const marker = this;

        // bounce marker three times then stop
        marker.setAnimation(window.google.maps.Animation.DROP);
        setTimeout(() => marker.setAnimation(null), 2100);

        // get venue details and display in infowindow
        getFSDetails(marker.id)
          .then(data => {
            checkData(marker, data);
            buildInfoContent(marker);
          })
          .catch(() => buildErrorContent(marker))
          .finally(() => {
            // set content and open window
            infowindow.setContent(marker.infoContent);
            infowindow.open(map, marker);

            // close list view in mobile if open so infowindow is not hidden by list
            if (self.props.listOpen) {
              toggleList();
            }
          });
      });
    });

    // size and center map
    map.fitBounds(bounds);
  }

  filterPlaces = event => {
    const { allPlaces } = this.state;
    const { infowindow } = this.props;
    const query = event.target.value.toLowerCase();

    // update state so input box shows current query value
    this.setState({ query: query });

    // close infoWindow when filter runs
    infowindow.close();

    // filter list markers by name of location
    const filteredPlaces = allPlaces.filter(place => {
      const match = place.name.toLowerCase().indexOf(query) > -1;
      place.marker.setVisible(match);
      return match;
    });

    // sort array before updating state
    filteredPlaces.sort(this.sortName);

    this.setState({ filteredPlaces: filteredPlaces });
  };

  showInfo = place => {
    // force marker click
    window.google.maps.event.trigger(place.marker, "click");
  };

  render() {
    const { apiReturned, filteredPlaces, query } = this.state;
    const { listOpen } = this.props;

    // API request fails
    if (this.state.apiError) {
      return <div> Oops, something is wrong! Please come back later.</div>;

      // API request returns successfully
    } else if (apiReturned && filteredPlaces) {
      return (
        <div>
          <input
            type="text"
            placeholder="find a place to eat or drink"
            value={query}
            onChange={this.filterPlaces}
            className="query"
            role="search"
            aria-label="text filter"
            tabIndex={listOpen ? "0" : "-1"}
          />
          {apiReturned && filteredPlaces.length > 0 ? (
            <ul className="list-places">
              {filteredPlaces.map((place, id) => (
                <Place key={place.id} place={place} listOpen={listOpen} />
              ))}
            </ul>
          ) : (
            <p id="filter-error" className="no-results">
              No results :(
            </p>
          )}
        </div>
      );

      // API request has not returned yet
    } else {
      return (
        <div className="loading-fs">
          <h4 className="loading-text">Loading...</h4>
          <img src={loader} className="loader" alt="loading" />
        </div>
      );
    }
  }
}

export default List;
