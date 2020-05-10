/* =====================
  Set up our map
===================== */
var map = L.map('map', {
  center: [51.5074, -0.1278],
  zoom: 11
});
var Stamen_TonerLite = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
}).addTo(map);


var dataset = "https://raw.githubusercontent.com/akshaynagar26/Midterm_Musa_611/master/converted.geojson";
var featureGroup;

var myStyle = function(feature){

if (feature.properties['review_scores_rating']>'93'){
  return {fillColor: '#1a9850'};
}
if (feature.properties['review_scores_rating']>'92'){
  return {fillColor: '#91cf60'};
}
if (feature.properties['review_scores_rating']>'91'){
  return {fillColor: '#d9ef8b'};
}
if (feature.properties['review_scores_rating']>'90'){
  return {fillColor: '#ffffbf'};
}
if (feature.properties['review_scores_rating']>'89'){
  return {fillColor: '#fee08b'};
}
if (feature.properties['review_scores_rating']>'88'){
  return {fillColor: '#fc8d59'};
}
if (feature.properties['review_scores_rating']<'88'){
  return {fillColor: '#ff6e99'};
}




};




var showResults = function() {
  /* =====================
  This function uses some jQuery methods that may be new. $(element).hide()
  will add the CSS "display: none" to the element, effectively removing it
  from the page. $(element).show() removes "display: none" from an element,
  returning it to the page. You don't need to change this part.
  ===================== */
  // => <div id="intro" css="display: none">



  $('#intro').hide();
  // => <div id="results">
  $('#results').show();
};


var eachFeatureFunction = function(layer) {
  layer.on('click', function (event) {
console.log(layer);
$('#s1').text(layer.feature.properties['review_scores_rating']);
$('#s2').text(layer.feature.properties['number_of_reviews']);

    /* =====================
    The following code will run every time a layer on the map is clicked.
    Check out layer.feature to see some useful data about the layer that
    you can use in your application.
    ===================== */

    showResults();
  });
};


var myFilter = function(feature) {
  console.log(feature.properties);
console.log(feature.properties['review_scores_rating'].length);
  if(feature.properties['review_scores_rating'].length<2){
    return false;
  }
  else {
    return true
  }

};


$(document).ready(function() {
  $.ajax(dataset).done(function(data) {
    var parsedData = JSON.parse(data);
    featureGroup = L.geoJson(parsedData, {
      style: myStyle,
      filter: myFilter
    }).addTo(map);

    // quite similar to _.each
    featureGroup.eachLayer(eachFeatureFunction);
  });
});
