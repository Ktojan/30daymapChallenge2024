import { Component } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import * as turf from 'turf';
import { environment } from '../../../env';
import { routes } from './routes';

const websocketUrl = 'https://echo.websocket.org/'; // demo websocket service with echo

@Component({
  selector: 'comp-moveAndStreamWS',
  template: `
     <div id="motion-control">
    <mat-slide-toggle class="toggler" [checked]="!animationIsStopped" (change)="toggleCameraAnimation($event)">Start/stop 3D motion</mat-slide-toggle>
  </div>
    <div id="map" #map>
`,
  styleUrl: './moveAndStreamWS.component.scss'
})
export class MoveAndStreamWS {
  map: mapboxgl.Map;
  streamer;
  isStreaming = false;
  animationIsStopped = true;

  ngAfterViewInit() {
    this.map = new mapboxgl.Map({
      container: 'map',
      accessToken: environment.public_token,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [6.5615, 46.0598], 
      bearing: -90,
      pitch: 50,
      zoom: 13 // starting zoom
    });

    this.addControls();
    this.addHandlers();
    this.toggleStream();
  }

  toggleCameraAnimation(event) {
    if (event.checked) {
        this.addPath();
        this.animationIsStopped = false;
    }
    else {
      this.stopCameraAnimation();
    }
  }

  stopCameraAnimation() {
    this.animationIsStopped = true;
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

    this.streamer.onmessage = (message) => {
      // let data = JSON.parse(message.data);
      // console.log(data)
    }
  }

  addControls() {
    const nav = new mapboxgl.NavigationControl({
      visualizePitch: true,
      showCompass: true,
      showZoom: true,
  });
  this.map.addControl(nav, 'top-right');

    this.map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        // When active the map will receive updates to the device's location as it changes.
        trackUserLocation: true,
        // Draw an arrow next to the location dot to indicate which direction the device is heading.
        showUserHeading: true
      })
    );
  }

  addHandlers() {
    this.map.on('dragend', () => {
      console.log(this.map.getCenter())
    })
  }

  addPath() {

    // this is the path the camera will look at
    const targetRoute = routes.target.slice(0, 8);
    // this is the path the camera will move along
    const cameraRoute = routes.camera.slice(0, 8);
    const animationDuration = 9000;
    const cameraAltitude = 2000;
    // get the overall distance of each route so we can interpolate along them
    const routeDistance = turf.lineDistance(turf.lineString(targetRoute));
    const cameraRouteDistance = turf.lineDistance(
      turf.lineString(cameraRoute)
    );

        let start;

        function frame(time) {
          if (this.animationIsStopped) return;
            if (!start) start = time;
            // phase determines how far through the animation we are
            const phase = (time - start) / animationDuration;
            const alongRoute = turf.along(
                turf.lineString(targetRoute),
                routeDistance * phase
            ).geometry.coordinates;

            const alongCamera = turf.along(
                turf.lineString(cameraRoute),
                cameraRouteDistance * phase
            ).geometry.coordinates;

            const camera = this.map.getFreeCameraOptions();
            camera.position = mapboxgl.MercatorCoordinate.fromLngLat(
                {
                    lng: alongCamera[0],
                    lat: alongCamera[1]
                },
                cameraAltitude
            );

            camera.lookAtPoint({ lng: alongRoute[0], lat: alongRoute[1] });

            if (Math.round(phase*100) % 10 == 0) {
              console.log('current target coordinates (1 of each 10)', alongRoute);
              if (this.streamer && this.isStreaming) {
                const googleCoords = [alongRoute[1], alongRoute[0]];
                this.streamer.send(JSON.stringify({ currentCoords: alongRoute, googleCoords }));
              }
            }

            this.map.setFreeCameraOptions(camera);

            const animationId = window.requestAnimationFrame(frame.bind(this));
            if (phase > 0.99) {
              window.cancelAnimationFrame(animationId);
              this.toggleStream();
            }   
           
        }
        window.requestAnimationFrame(frame.bind(this));
  }
}


