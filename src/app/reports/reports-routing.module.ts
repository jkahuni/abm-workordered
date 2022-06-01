import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsComponent } from '@reports/reports.component';

// exported/children components
import { SectionsPerMonthComponent } from '@reports/components/maintenance-cost/sections-per-month/sections-per-month.component';
import { FourMonthsPeriodComponent } from '@reports/components/maintenance-cost/four-months-period/four-months-period.component';
import { OneMonthPeriodComponent } from '@reports/components/maintenance-cost/one-month-period/one-month-period.component';
import { OneWeekPeriodComponent } from '@reports/components/maintenance-cost/one-week-period/one-week-period.component';


// firebase auth guards
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

const redirectToLogin = () => redirectUnauthorizedTo(['authentication/sign-in']);



const routes: Routes = [
  {
    path: '', component: ReportsComponent,
    ...canActivate(redirectToLogin)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }

export const childrenComponents = [
  SectionsPerMonthComponent,
  FourMonthsPeriodComponent,
  OneMonthPeriodComponent,
  OneWeekPeriodComponent
];
