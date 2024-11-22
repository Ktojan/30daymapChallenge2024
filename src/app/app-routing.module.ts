import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectAccessGuard } from './project-access.guard';
import { Day183DComponent } from './day18-3d/day18.component';
import { NotFoundPageComponent } from './not-found-page/not-found-page.component';
import { MoveAndStreamWS } from './moveAndStreamWS/moveAndStreamWS.component';
import { Day24Component } from './day24-circular/day24.component';
import { AnimatePointComponent } from './animate-point/animate-point.component';

const routes: Routes = [
  {path: 'day18', component: Day183DComponent },
  {path: 'day24', component: Day24Component },
  {path: 'moveAndStreamWS', component: MoveAndStreamWS },
  {path: 'point', component: AnimatePointComponent },
  {path: '', pathMatch: 'full', redirectTo: 'moveAndStreamWS'},
  {path: '**', component: NotFoundPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
