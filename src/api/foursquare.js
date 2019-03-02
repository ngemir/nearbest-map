import { CLIENT_ID, CLIENT_SECRET } from "../keys/keys";

const sortName = (a, b) => {
  // remove case senstivity
  const nameA = a.name.toUpperCase();
  const nameB = b.name.toUpperCase();
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  // if names are equal
  return 0;
};

// url and params
const fSURL = "https://api.foursquare.com/v2/venues/";
const VERS = "20181215";
const RADIUS = "800";
const CATEGORIES = {
  food: '4d4b7105d754a06374d81259',
  store: '4d4b7105d754a06378d81259'
};
// create array of categories
const CATEGORY_ID = Object.keys(CATEGORIES).map(cat => CATEGORIES[cat]);

export const getFSLocations = mapCenter => {
  const requestURL = `${fSURL}search?ll=${mapCenter.lat},${
    mapCenter.lng
  }&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&v=${VERS}&categoryId=${CATEGORY_ID}&radius=${RADIUS}&limit=50`;
  return fetch(requestURL)
    .then(response => {
      if (!response.ok) {
        throw response;
      } else return response.json();
    })
    .then(data => {
      const places = data.response.venues;
      const goodPlaces = places.filter(
        place =>
          place.location.address &&
          place.location.city &&
          place.location.city === "São Paulo"
      );

      // sort before updating state
      goodPlaces.sort(sortName);

      return goodPlaces;
    });
};

export const getFSDetails = fsid => {
  // use Foursquare id for search
  const FSID = fsid;

  const requestURL = `${fSURL}${FSID}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&v=${VERS}`;
  return fetch(requestURL).then(response => {
    if (!response.ok) {
      throw response;
    } else return response.json();
  });
};
