/* =====================
  Global Variables
===================== */
var cctvdata;
var cctvFilters;
var sqgrid;
var mappedGrid;
var filteredcctvdata
var baseHexStyle = { stroke: false }

/* =====================
  Map Setup
===================== */
// Notice that we've been using an options object since week 1 without realizing it
var mapOpts = {
  center: [39.2904, -76.6122],
  zoom: 30
};
var map = L.map('map', mapOpts);

// Another options object
var tileOpts = {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: 'abcd',
  minZoom: 2,
  maxZoom: 30,
  ext: 'png'
};
var Stamen_TonerLite = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}', tileOpts).addTo(map);

var data_3_geojson = {
  type: "FeatureCollection",
  features: [],
};


var cctvdata;
var filteredcctvdata;

$.ajax('https://data.baltimorecity.gov/resource/nn6t-vxz4.json').done(function(data) {
  for (var i = 0; i < 720; i++) {
    data_3_geojson.features.push({
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [data[i].location_1.longitude, data[i].location_1.latitude]
      },
      "properties": {
        "project": data[i].project,
        "name": data[i].name,
        "lon": data[i].location_1.longitude,
        "lat":  data[i].location_1.latitude
      }
    });
  }
  cctvdata = data_3_geojson;
  // cctvdata = JSON.parse(data_3_geojson);
  // Fixing an AWFUL bug caused by BAD data: Features *NEED* to have geometries...
  // cctvdata.features = _.filter(cctvdata.features, function(f) { return f.geometry; });

  // The data includes some strange outliers - let's limit it to the area with lots of data
  // The spatial filter produced here was produced on geojson.io (which uses leaflet draw!)
  // var spatialFilter = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[-75.22218704223633,39.885108787598114],[-75.22218704223633,39.9380402756277],[-75.13412475585938,39.9380402756277],[-75.13412475585938,39.885108787598114],[-75.22218704223633,39.885108787598114]]]}}]};
  // cctvdata = turf.within(cctvdata, spatialFilter);

  // Fit map to data bounds
  var mapBoundary = L.geoJson(turf.envelope(cctvdata)).getBounds();
  map.fitBounds(mapBoundary);

  // We'll place a hexagonal grid over the entire mapped area (hexagons are better than
  // squares because square east/west and north/south distance is less than diagonal distance
  var turfFriendlyBoundary = [mapBoundary.getWest(), mapBoundary.getSouth(), mapBoundary.getEast(), mapBoundary.getNorth()];
  sqgrid = turf.squareGrid(turfFriendlyBoundary, 0.2, 'miles');

  // Update the HTML DOM to reflect all the unique crime types
  // Map over cctvdata features for 'properties.text_general_code' and get the unique results
  var uniqueCrimeTypes = _.unique(_.map(cctvdata.features, function(f) { return f.properties.project; }));

  // For each unique text, create a  checkbox
  _.each(uniqueCrimeTypes, function(crimeText, index) {
    $('#checkboxes').append('<label><input type="checkbox" />' + crimeText + '</label></br>');
  });


  $('#doFilter').click(function() {
    // Here, we're using jQuery's `map` function; it works very much like underscore's
    // We want true if checked, false if not
    var checkboxValues = $('input[type=checkbox]').map(function(_, element) {
          return $(element).prop('checked');
    }).get();

    // Let's "zip" checkbox values and checkbox text up together so that we can see values next to text
    // Zipping takes two arrays (e.g. ['a', 'b', 'c'] and [1, 2, 3]) and produces an output
    // (for this example, that output would be [['a', 1], ['b', 2], ['c', 3]])
    // This is a nifty trick for functionally manipulating data
    var zippedCrimeTypes = _.zip(checkboxValues, uniqueCrimeTypes);

    // Our data, at this point, looks something like this: [[true, 'aCrimeType], [false, 'unwantedCrimeType']]
    // Now, we want to return all and only crime types whose "zipped" values are true
    // This involves filtering for true values at index 0 and getting the text at index 1
    cctvFilters = _.chain(zippedCrimeTypes)
      .filter(function(zip) { return zip[0]; })
      .map(function(zip) { return zip[1]; })
      .value();

    // Carry out filter
    filteredcctvdata = _.clone(cctvdata); // Cloning here so we don't overwrite data on the original object
    filteredcctvdata.features = _.filter(filteredcctvdata.features, function(f) {
      return _.contains(cctvFilters, f.properties.project);
    });

    // Remove any outdated data
    if (mappedGrid) { map.removeLayer(mappedGrid); }
    mappedGrid = L.geoJson(turf.count(sqgrid, filteredcctvdata, 'captured'), {
      style: function(feature) {
        return {
          stroke: false,
          fillColor: '#00c700',
          fillOpacity: (feature.properties.captured*0.08)
        };
      },
      onEachFeature: function(feature, layer) {
        layer.bindPopup("Number of CCTVS: " + feature.properties.captured);
      }
    }).addTo(map);
  });
});
