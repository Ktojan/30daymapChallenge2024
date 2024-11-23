import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Day183DComponent } from './day18-3d/day18.component';
import { MoveAndStreamWS } from './moveAndStreamWS/moveAndStreamWS.component';
import { Day24Component } from './day24-circular/day24.component';
// --------------------------- MAPBOX stuff and files ----------------- //
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
// ---------------------------Material stuff ----------------------//
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MapboxService } from './day18-3d/mapbox.service';
import { MatCardModule } from '@angular/material/card';
import { NotFoundPageComponent } from './not-found-page/not-found-page.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule,  MatDialogActions,  MatDialogClose,  MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { AnimatePointComponent } from './animate-point/animate-point.component';
import { DroneMissionComp } from './drone-mission-mimic/drone-mission.component';

@NgModule({
  declarations: [
    AppComponent,
    Day183DComponent,
    MoveAndStreamWS,
    Day24Component,
    AnimatePointComponent,
    DroneMissionComp,
    NotFoundPageComponent
  ],
  imports: [
    BrowserModule, BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    MatDialogModule, MatDialogActions,  MatDialogClose,  MatDialogContent, MatDialogTitle , MatCardModule, MatButtonModule, MatSelectModule,
    MatInputModule, MatSlideToggleModule, MatIconModule, MatMenuModule,
    NgxMapboxGLModule,
  ],
  providers: [MapboxService],
  bootstrap: [AppComponent]
})
export class AppModule { }
