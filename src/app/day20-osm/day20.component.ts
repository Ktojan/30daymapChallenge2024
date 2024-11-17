// --------------------------- ANGULAR  ----------------- //
import { Component, ElementRef, inject, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as L from 'leaflet';

@Component({
  selector: 'comp-day20',
  templateUrl: './day20.component.html',
  styleUrl: './day20.component.scss'
})
export class Day20Component {
  @ViewChild('map') mapElement: ElementRef<HTMLElement>;
  readonly dialog = inject(MatDialog);

  map: L.Map = null;
  osm: L.TileLayer = {};
  osmHOT: L.TileLayer = {};
  nexrad: L.TileLayer = {};
  poles: L.TileLayer = {};
  layerControl: L.Control;

  config = {
    KansasCoords: [ -94.55903187256962, 39.10480648307469 ].reverse(),
    basicZoom: 19,
    secondaryZoom: 16,
    default_gray: '#BBB',
    defaultFillOpacity: 0.6,
  }

  ngAfterViewInit() {
    this.createLayers();
    // this.importPolygonsFromGeoJSONs();
    this.setupMap();
    this.addControls();
    // this.generateLegends();
  }


  createLayers() {
    this.osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: this.config.basicZoom,
      attribution: 'Tiles style by Humanitarian OpenStreetMap Team'
    });
    this.osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: this.config.basicZoom,
      attribution: '© OpenStreetMap'
    });
    this.poles = L.tileLayer.wms("https://ahocevar.com/geoserver/ne/wms", {
      layers: 'ne:ne_10m_admin_0_countries',
      format: 'image/png',
      transparent: true,
      attribution: "Weather data © 2012 IEM Nexrad"
  });
  //   this.nexrad = L.tileLayer.wms("http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi", {
  //     layers: 'nexrad-n0r-900913',
  //     format: 'image/png',
  //     transparent: true,
  //     attribution: "Weather data © 2012 IEM Nexrad"
  // });
  }

  setupMap() {
    this.map = L.map('map', {
      layers: [
        this.osm,
        this.poles
      ]
    }).setView(this.config.KansasCoords, 9);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: this.config.basicZoom,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    this.osmHOT.addTo(this.map);  //detailed map from humanitarian france team
    
    console.log('--- The Map using Leaflet is Created! ----', this.map);
  }

  addControls() {
    const baseMaps = {
      "OpenStreetMap Detailed": this.osmHOT,
      "OpenStreetMap Basic": this.osm,
      'Poles': this.poles,
      // 'Nexrad weather': this.nexrad
    };
    this.layerControl = L.control.layers(baseMaps).addTo(this.map);

    const openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: this.config.basicZoom,
      attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
    });
    this.layerControl.addBaseLayer(openTopoMap, "Topographic Map");
    // show the scale bar on the lower left corner
    L.control.scale({imperial: false, metric: true, maxWidth: 200}).addTo(this.map);
  }

}
