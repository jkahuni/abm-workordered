import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { ReportsComponent } from '@reports/reports.component';
import { MaintenanceCostComponent } from '@reports/components/maintenance-cost/maintenance-cost.component';
import { IncidentMetricsComponent } from '@reports/components/incident-metrics/incident-metrics.component';


// maintenance cost components
import { McOneSectionMultipleMonthsPeriodComponent } from '@reports/components/maintenance-cost/mc-one-section-multiple-months-period/mc-one-section-multiple-months-period.component';
import { McOneSectionOneMonthPeriodComponent } from '@reports/components/maintenance-cost/mc-one-section-one-month-period/mc-one-section-one-month-period.component';
import { McOneSectionOneWeekPeriodComponent } from '@reports/components/maintenance-cost/mc-one-section-one-week-period/mc-one-section-one-week-period.component';
import { McMultipleSectionsOneMonthPeriodComponent } from '@reports/components/maintenance-cost/mc-multiple-sections-one-month-period/mc-multiple-sections-one-month-period.component';

// incident metrics components
import { ImMttaPerSectionPerMonthComponent } from '@reports/components/incident-metrics/im-mtta-per-section-per-month/im-mtta-per-section-per-month.component';
import { ImMttaSectionsPerMonthComponent } from '@reports/components/incident-metrics/im-mtta-sections-per-month/im-mtta-sections-per-month.component';



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

export const maintenanceCostsComponents = [
  McMultipleSectionsOneMonthPeriodComponent,
  McOneSectionMultipleMonthsPeriodComponent,
  McOneSectionOneMonthPeriodComponent,
  McOneSectionOneWeekPeriodComponent,
];

export const incidentMetricsComponents = [
  ImMttaPerSectionPerMonthComponent,
  ImMttaSectionsPerMonthComponent
];
