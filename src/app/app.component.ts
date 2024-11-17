import { Component } from '@angular/core';

@Component({
  selector: 'comp-root',
  template: `
    <h1>Welcome to {{title}}!</h1>

    <router-outlet />
  `,
  styles: []
})
export class AppComponent {
  title = '30daymapChallenge2024';
}
