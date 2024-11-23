import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

@Component({
  selector: 'comp-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  @ViewChild('aboutModal') aboutModal: TemplateRef<HTMLElement>;
  dialog = inject(MatDialog);
  selectedDayLabel = '';
  displayAbout = true;
  private router = inject(Router);

  menuLinks = [
    {
      routerLink: '/day18',
      icon: 'view_in_ar',
      label: 'Day 18 - 3D',
      hasOwnAbout: false      
    },
    {
      routerLink: '/day24',
      icon: 'grid_4x4',
      label: 'Day 24 - Circular',
      hasOwnAbout: true     
    },    
    {
      routerLink: '/moveAndStreamWS',
      icon: 'settings_input_antenna',
      label: 'Stream location via websocket',
      hasOwnAbout: true     
    },    
    {
      routerLink: '/point',
      icon: 'flight',
      label: 'Animate flight',
      hasOwnAbout: true     
    }    
  ]

  ngOnInit() {
    this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.url)
    ).subscribe(link => {
      const item = this.menuLinks.find(el => el.routerLink === link);
      if (!item) return;
      this.selectedDayLabel = item?.label || '';
      this.displayAbout = !item.hasOwnAbout;
  })
  }

  clickAbout(enterAnimationDuration: string, exitAnimationDuration: string) {
    this.dialog.open(this.aboutModal, { 
      width: '50vw',
      enterAnimationDuration,
      exitAnimationDuration,
     });
  }}
