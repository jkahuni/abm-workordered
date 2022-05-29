import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceCostComponent } from '@reports/components/maintenance-cost/maintenance-cost.component';
import { ReportsComponent } from '@reports/reports.component';
// firebase auth guards
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

const redirectToLogin = () => redirectUnauthorizedTo(['authentication/sign-in']);



const routes: Routes = [
  {
    path: '', component: ReportsComponent,
    ...canActivate(redirectToLogin) },
  { path: 'reports/maintenance-cost', component: MaintenanceCostComponent,
...canActivate(redirectToLogin)}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
