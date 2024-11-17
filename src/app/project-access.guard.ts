import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectAccessGuard implements CanActivate {
  canActivate(): boolean {
    alert('Not ready yet');
    return false;
  }
}
