
// Function to determine marker size based on population
function markerSize(mag) 
{
    return mag * 50000;
}

// Function to determine marker color
function color(depth) 
{ 
    if (depth >= -10 && depth <= 10.99) { return "#5BFF33" } else
    if (depth >=  11 && depth <= 30.99) { return "#FFC300"  } else
    if (depth >=  31 && depth <= 50.99) { return "#FF5733" } else
    if (depth >=  51 && depth <= 70.99) { return "#C70039" } else
    if (depth >=  71 && depth <= 90) { return "#900C3F" } else
    if (depth >  90) { return "#581845" };
};

function dateConversion(timestamp)
{
    var newDate = new Date(timestamp);
    return newDate;
}


d3.json("plates.json").then((json) => 
{


    /* Gathering coordinates for Tectonic Plates*/
    var data = json[0].features
    latlngs = []
    
    /* creating the polyline */
    data.forEach(i => {   
        
        coordinates = i.geometry.coordinates[0]
        newCoordinates = [coordinates.map(datum => [datum[1],datum[0]])]
        latlngs.push (
            L.polyline(newCoordinates, {weight : 2, color: 'red'})
        )
    })

    /* gathering earthquake data */
    url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"

    d3.json(url).then(function(response) 
    {
        var earthquakes = response.features
        var locationMarkers = []
    
        /* creating eathquake markers */
        earthquakes.forEach(quake => {

            locationMarkers.push ( 
                L.circle([quake.geometry.coordinates[1], quake.geometry.coordinates[0]],
                {
                    stroke:true,
                    weight: .3,
                    color: "black",
                    fillOpacity: .75,
                    fillColor: color(quake.geometry.coordinates[2]),
                    radius: markerSize(quake.properties.mag)

                    
                }).bindPopup(`  <h2> ${quake.properties.place} </h2> <hr>
                                <h3> Magnitude: ${quake.properties.mag} </h3>
                                <h3> Depth: ${quake.geometry.coordinates[2]} km
                                <h3> Time: ${dateConversion(quake.properties.time)} </h3>`)
            ) 
        }) 

             
        /* layers as an object */
        var quakes = L.layerGroup(locationMarkers);
        var tecPlates = L.layerGroup(latlngs);
    

        /* creating the map layers */
        
        var lightMap = L.tileLayer (
        "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
        {
            attribution:
            "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
            tileSize: 512,
            maxZoom: 18,
            zoomOffset: -1,
            id: "mapbox/streets-v11",
            accessToken: API_KEY,
        })

         
        var satellite = L.tileLayer(
        "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
        {
            attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: "satellite-v9",
            accessToken: API_KEY,
        });

        var darkMap = L.tileLayer(
        "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
        {
            attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: "dark-v10",
            accessToken: API_KEY,
        });


        /* creating the base map object */
        var baseMaps = {
            "Dark Map" : darkMap, 
            "Light Map" : lightMap,  
            "Satellite View" : satellite 
        }

        var overlayMaps = {
            "Earth Quakes": quakes,
            "Tectonic Plates" : tecPlates
        };

        /* starting point */
        var startingCoordinates= [31.9686, -99.9018]
        var zoomLevel = 3

        /* creating map as an object */
        var myMap = L.map("map-id", {
            center: startingCoordinates,
            zoom: zoomLevel,
            layers: [darkMap, quakes]
        });

        /* adding the control */
        L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
        }).addTo(myMap);


        /* creating legend (modified from stack overflow)*/
        var legend = L.control({
            position: "bottomright"
          });
        
          legend.onAdd = function() {
            var div = L.DomUtil.create("div", "legend");
        
            var depth = ['-10 km (BGS) ', '10 km (BGS)', `30 km (BGS)`, `50 km (BGS)`, `70 km (BGS)`, `90 km (BGS)`];
            var depthColor = ["#5BFF33", "#FFC300", "#FF5733", "#C70039", "#900C3F", "#581845"];
        
        
            for (var i = 0; i < depth.length; i++) {
              div.innerHTML +=
              "<i style='background: " + depthColor[i] + "'></i> " +
              depth[i] + (depth[i + 1] ? " &ndash; " + depth[i + 1] + "<br>" : "+");
            }
            return div;
        
          };
        
        legend.addTo(myMap)


    })

})












