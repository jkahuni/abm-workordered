import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { ReportsComponent } from '@reports/reports.component';
import { MaintenanceCostComponent } from '@reports/components/maintenance-cost/maintenance-cost.component';
import { IncidentMetricsComponent } from '@reports/components/incident-metrics/incident-metrics.component';


// exported/children components
import { McOneSectionMultipleMonthsPeriodComponent } from '@reports/components/maintenance-cost/mc-one-section-multiple-months-period/mc-one-section-multiple-months-period.component';
import { McOneSectionOneMonthPeriodComponent } from '@reports/components/maintenance-cost/mc-one-section-one-month-period/mc-one-section-one-month-period.component';
import { McOneSectionOneWeekPeriodComponent } from '@reports/components/maintenance-cost/mc-one-section-one-week-period/mc-one-section-one-week-period.component';
import { McMultipleSectionsOneMonthPeriodComponent } from '@reports/components/maintenance-cost/mc-multiple-sections-one-month-period/mc-multiple-sections-one-month-period.component';



// firebase auth guards
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

const redirectToLogin = () => redirectUnauthorizedTo(['authentication/sign-in']);



const routes: Routes = [
  {
    path: '',
    component: ReportsComponent,
    ...canActivate(redirectToLogin)
  },
  {
    path: 'maintenance-costs',
    component: MaintenanceCostComponent,
    ...canActivate(redirectToLogin)
  },
  {
    path: 'incident-metrics',
    component: IncidentMetricsComponent,
    ...canActivate(redirectToLogin)
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }

export const childrenComponents = [
  McMultipleSectionsOneMonthPeriodComponent,
  McOneSectionMultipleMonthsPeriodComponent,
  McOneSectionOneMonthPeriodComponent,
  McOneSectionOneWeekPeriodComponent,
];
