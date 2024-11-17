import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'comp-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  @ViewChild('aboutModal') aboutModal: TemplateRef<HTMLElement>;
  dialog = inject(MatDialog);

  menuLinks = [
    {
      routerLink: '/day18',
      icon: 'view_in_ar',
      label: 'Day 18: 3D',      
    },
    {
      routerLink: '/day20',
      icon: 'volunteer_activism',
      label: 'Day 20: OSM',
      disabled: true
    },
    {
      routerLink: '/day26',
      icon: 'grid_4x4',
      label: 'Day 26: Projections',
      disabled: true
    }    
  ]

  clickAbout(enterAnimationDuration: string, exitAnimationDuration: string) {
    this.dialog.open(this.aboutModal, { 
      width: '50vw',
      enterAnimationDuration,
      exitAnimationDuration,
     });
  }}
