import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '@home/components/home/home.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'resources', loadChildren: () => import('./resources/resources.module').then(m => m.ResourcesModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
