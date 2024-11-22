import { Component } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import * as turf from "../plugins/turf.min.js"
import { environment } from '../../../env.js';

@Component({
  selector: 'comp-animate-point',
  template: `
    <button id="start-button" (click)="start()"> Start animate</button>
    <div id="mapAnimate" #mapAnimate>`,
  styleUrl: './animate-point.component.scss'
})
export class AnimatePointComponent {
  map: mapboxgl.Map;
  replayAvailable = true;

  ngAfterViewInit() {
    this.map = new mapboxgl.Map({
      container: 'mapAnimate',
      accessToken: environment.public_token,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-96, 37.8],
      zoom: 3,
      pitch: 40
    });
  }

  start() {
    // San Francisco
    const origin = [-122.414, 37.776];
    // Washington DC
    const destination = [-77.032, 38.913];

    // A simple line from origin to destination.
    const route = {
      'type': 'FeatureCollection',
      'features': [
          {
              'type': 'Feature',
              'geometry': {
                  'type': 'LineString',
                  'coordinates': [origin, destination]
              }
          }
      ]
  };

  // A single point that animates along the route.
  // Coordinates are initially set to origin.
  const point = {
      'type': 'FeatureCollection',
      'features': [
          {
              'type': 'Feature',
              'properties': { 'bearing': 0},
              'geometry': {
                  'type': 'Point',
                  'coordinates': origin
              }
          }
      ]
  };

  // Calculate the distance in kilometers between route start/end point.
  const lineDistance = turf.length(route.features[0]);
  const arc = [];
  const steps = 500;

  // Draw an arc between the `origin` & `destination` of the two points
  for (let i = 0; i < lineDistance; i += lineDistance / steps) {
      const segment = turf.along(route.features[0], i);
      arc.push(segment.geometry.coordinates);
  }

  // Update the route with calculated arc coordinates
  route.features[0].geometry.coordinates = arc;

  // Used to increment the value of the point measurement against the route.
  let counter = 0;

      // Add a source and layer displaying a point which will be animated in a circle.
      this.map.addSource('route', {
          'type': 'geojson',
          'data': route
      });

      this.map.addSource('point', {
          'type': 'geojson',
          'data': point
      });

      this.map.addLayer({
          'id': 'route',
          'source': 'route',
          'type': 'line',
          'paint': {
              'line-width': 2,
              'line-color': '#007cbf'
          }
      });

      this.map.addLayer({
          'id': 'point',
          'source': 'point',
          'type': 'symbol',
          'layout': {
              'icon-image': 'airport',
              'icon-size': 1.5,
              'icon-rotate': ['get', 'bearing'],
              'icon-rotation-alignment': 'map',
              'icon-allow-overlap': true,
              'icon-ignore-placement': true
          }
      });
      let running = false;

      const comp = this;

      function animate() {
          running = true;
          const start =
              route.features[0].geometry.coordinates[
                  counter >= steps ? counter - 1 : counter
              ];
          const end =
              route.features[0].geometry.coordinates[
                  counter >= steps ? counter : counter + 1
              ];
              console.log(start, end);

          if (!start || !end) {
              running = false;
              return;
          }
          // Update point geometry to a new position based on counter denoting
          // the index to access the arc
          point.features[0].geometry.coordinates =
              route.features[0].geometry.coordinates[counter];

          // Calculate the bearing to ensure the icon is rotated to match the route arc
          // The bearing is calculated between the current point and the next point, except
          // at the end of the arc, which uses the previous point and the current point
          point.features[0].properties.bearing = turf.bearing(
              turf.point(start),
              turf.point(end)
          );

          // Update the source with this new data
          comp.map.getSource('point').setData(point);

          // Request the next frame of animation as long as the end has not been reached
          console.log('counter ', counter, ' steps ', steps);

          if (counter < steps) {
              requestAnimationFrame(animate.bind(comp, counter));
          }

          counter++;
      }

      // Start the animation
      animate.call(comp, counter);
  }
}


