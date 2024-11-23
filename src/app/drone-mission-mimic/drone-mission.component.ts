import { Component } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from '../../../env';
import { InitialMarkers, WayPointsBasilica, WayPointsMaximum, WayPointsObelisque } from './wayPoints';
import { Default3DbuildingsConfig } from '../day18-3d/mapbox.service';
import { MercatorCoordinate, Map } from 'mapbox-gl';

const websocketUrl = 'https://echo.websocket.org/'; // demo websocket service with echo

@Component({
  selector: 'comp-moveAndStreamWS',
  templateUrl: "./drone-mission.component.html",
  styleUrl: './drone-mission.component.scss'
})
export class DroneMissionComp {
  map: mapboxgl.Map;
  streamer;
  isStreaming = false;
  animationIsStopped = true;
  customMarkers = InitialMarkers;
  wayPointsBasilica = WayPointsBasilica;
  wayPointsMaximum = WayPointsMaximum;
  wayPointsObelisque = WayPointsObelisque;

  activeWayPoints = this.wayPointsBasilica;
  targetIndex = 0;
  activateMission1 = false;
  currentCameraPosition = null;
  config = {
    token: environment.public_token,
    mapStyle: 'mapbox://styles/mapbox/streets-v9',
    center: [12.4985118242098, 41.89739388476113], // [15.669, 44.213],
    currentZoom: 17,
    pitch: 25,
    bearing: 106,
    cursorStyle: 'grab',
    paints: {
      d3buildings: Default3DbuildingsConfig
    },
  }

  mapCreation(mapInstance: Map) {
    this.map = mapInstance;
    console.log('Mapbox-gl map created: ', mapInstance);    
    this.map.on('error', (errorMessage) => {
      console.error('A error event occurred.', errorMessage);
    });

    this.addControls();
    this.addHandlers();
    this.toggleStream();
  }

  toggleCameraAnimation(event) {
    if (event.checked) {
        // this.addPath();
        this.startCameraAnimation();
        this.animationIsStopped = false;
    }
    else {
      this.stopCameraAnimation();
    }
  }

  toggleMission(event, wayName, targetIndex) {
    this.targetIndex = targetIndex;
    this.activeWayPoints = event.checked ? this[wayName] : [];
  }

  toggleStream() {
    if (this.streamer && this.isStreaming) {
      this.streamer.send('Close!');
      this.streamer.close();
      this.streamer = null;
    } else {
      this.streamer = new WebSocket(websocketUrl);
      this.openStream();
    }
    this.isStreaming = !this.isStreaming;
  }

  openStream() {
    this.streamer.onopen = () => {
      this.isStreaming = 1 === this.streamer.readyState;
    }
  }

  addControls() {
    const nav = new mapboxgl.NavigationControl({
      visualizePitch: true,
      showCompass: true,
      showZoom: true,
  });
  this.map.addControl(nav, 'top-right');   
  }

  addHandlers() {
    this.map.on('dragend', () => {
      console.log(this.map.getCenter())
    })
  }

  updateCameraPosition(position, altitude, target) {
    const camera = this.map.getFreeCameraOptions();
    camera.position = MercatorCoordinate.fromLngLat( position, altitude );
    this.currentCameraPosition = camera.position;
    camera.lookAtPoint(target);
    this.map.setFreeCameraOptions(camera);
  }

  stopCameraAnimation() {
    this.animationIsStopped = true;
  }

  startCameraAnimation() {
    let animationIndex = 0;
    let animationTime = 0.0;

    // linearly interpolate between two altitudes/positions based on time
    function linearInterpolation(a, b, t) {
      if (Array.isArray(a) && Array.isArray(b)) {
        const result = [];
        for (let i = 0; i < Math.min(a.length, b.length); i++)
          result[i] = a[i] * (1.0 - t) + b[i] * t;
        return result;
      } else {
        return a * (1.0 - t) + b * t;
      }
    };

    const alt_initial = 360, alt_middle = 360, alt_final = 360;
    const target = this.customMarkers[this.targetIndex].coords;
    const pointsInChunk = Math.round(this.activeWayPoints.length / 3);
    console.log(pointsInChunk);

    const animations = [
      {
        duration: pointsInChunk * 1500,
        animate: (phase) => {
          const start = this.activeWayPoints[0].coords,
            end = this.activeWayPoints[pointsInChunk].coords;
          const alt = [alt_initial, alt_middle];
          // interpolate camera position while keeping focus on a target lat/lng
          const position = linearInterpolation(start, end, phase);
          const altitude = linearInterpolation(alt[0], alt[1], phase);
          this.updateCameraPosition(position, altitude, target);
        }
      },
      {
        duration: pointsInChunk * 1500,
        animate: (phase) => {
          const start = this.activeWayPoints[pointsInChunk].coords,
            end = this.activeWayPoints[pointsInChunk*2].coords;
          const alt = [alt_middle, alt_middle];
          const position = linearInterpolation(start, end, phase);
          const altitude = linearInterpolation(alt[0], alt[1], phase);
          this.updateCameraPosition(position, altitude, target);
        }
      },
      {
        duration: pointsInChunk * 1500,
        animate: (phase) => {
          const start = this.activeWayPoints[pointsInChunk*2].coords,
            end = this.activeWayPoints.at(-1).coords;
          const alt = [alt_middle, alt_final];
          const position = linearInterpolation(start, end, phase);
          const altitude = linearInterpolation(alt[0], alt[1], phase);
          this.updateCameraPosition(position, altitude, target);
        }
      },
    ];
    let lastTime = (document.timeline.currentTime as number) || 0;

    function frameCustomFunction(timestamp) {
      if (this.animationIsStopped) return;
      animationIndex %= animations.length;
      const current = animations[animationIndex];
      let animPhase;
      if (animationTime < current.duration) {
        // Normalize the duration between 0 and 1 to interpolate the animation
        animPhase = animationTime / current.duration;
        // log info for each one of 250 animation frames
        if (Math.round(animationTime) % 250 == 0) {
          console.log('Animation number ', (animationIndex+1) + ' \n phase: ' + (animPhase * 100).toFixed(1) + '% \n  ms passed from start: ' + Math.round(animationTime));
          if (this.currentCameraPosition) this.streamer.send(JSON.stringify(this.currentCameraPosition));
        }
        current.animate(animPhase);
      }

      const elapsed = timestamp - lastTime;
      animationTime += elapsed;
      lastTime = timestamp;

      if (animationTime > current.duration) {
        animationIndex++;
        animationTime = 0.0;
        console.log(`---- START ANIMATION ${animationIndex} ------`)
      }

      const animationId = window.requestAnimationFrame(frameCustomFunction.bind(this));
      if (animationIndex == animations.length && animPhase > 0.99) {
        this.animationIsStopped = true;
        window.cancelAnimationFrame(animationId);
      }
    }
    window.requestAnimationFrame(frameCustomFunction.bind(this));
  }

  // addPath() {

  //   // this is the path the camera will look at
  //   const targetRoute = routes.target.slice(0, 8);
  //   // this is the path the camera will move along
  //   const cameraRoute = routes.camera.slice(0, 8);
  //   const animationDuration = 9000;
  //   const cameraAltitude = 2000;
  //   // get the overall distance of each route so we can interpolate along them
  //   const routeDistance = turf.lineDistance(turf.lineString(targetRoute));
  //   const cameraRouteDistance = turf.lineDistance(
  //     turf.lineString(cameraRoute)
  //   );

  //       let start;

  //       function frame(time) {
  //         if (this.animationIsStopped) return;
  //           if (!start) start = time;
  //           // phase determines how far through the animation we are
  //           const phase = (time - start) / animationDuration;
  //           const alongRoute = turf.along(
  //               turf.lineString(targetRoute),
  //               routeDistance * phase
  //           ).geometry.coordinates;

  //           const alongCamera = turf.along(
  //               turf.lineString(cameraRoute),
  //               cameraRouteDistance * phase
  //           ).geometry.coordinates;

  //           const camera = this.map.getFreeCameraOptions();
  //           camera.position = mapboxgl.MercatorCoordinate.fromLngLat(
  //               {
  //                   lng: alongCamera[0],
  //                   lat: alongCamera[1]
  //               },
  //               cameraAltitude
  //           );

  //           camera.lookAtPoint({ lng: alongRoute[0], lat: alongRoute[1] });

  //           if (Math.round(phase*100) % 10 == 0) {
  //             console.log('current target coordinates (1 of each 10)', alongRoute);
  //             if (this.streamer && this.isStreaming) {
  //               const googleCoords = [alongRoute[1], alongRoute[0]];
  //               this.streamer.send(JSON.stringify({ currentCoords: alongRoute, googleCoords }));
  //             }
  //           }

  //           this.map.setFreeCameraOptions(camera);

  //           const animationId = window.requestAnimationFrame(frame.bind(this));
  //           if (phase > 0.99) {
  //             window.cancelAnimationFrame(animationId);
  //             this.toggleStream();
  //           }   
           
  //       }
  //       window.requestAnimationFrame(frame.bind(this));
  // }
}


