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
// acknowledge
import { AcknowledgeMultipleSectionsComponent } from '@reports/components/incident-metrics/mean-time-to-acknowledge/acknowledge-multiple-sections/acknowledge-multiple-sections.component';
import { AcknowledgeSectionOneMonthComponent } from '@reports/components/incident-metrics/mean-time-to-acknowledge/acknowledge-section-one-month/acknowledge-section-one-month.component';
import { AcknowledgeSectionMultipleMonthsComponent } from '@reports/components/incident-metrics/mean-time-to-acknowledge/acknowledge-section-multiple-months/acknowledge-section-multiple-months.component';
import { AcknowledgeSectionOneWeekComponent } from '@reports/components/incident-metrics/mean-time-to-acknowledge/acknowledge-section-one-week/acknowledge-section-one-week.component';

// approve
import { ApproveMultipleSectionsComponent } from '@reports/components/incident-metrics/mean-time-to-approve/approve-multiple-sections/approve-multiple-sections.component';
import { ApproveSectionMultipleMonthsComponent } from '@reports/components/incident-metrics/mean-time-to-approve/approve-section-multiple-months/approve-section-multiple-months.component';
import { ApproveSectionOneMonthComponent } from '@reports/components/incident-metrics/mean-time-to-approve/approve-section-one-month/approve-section-one-month.component';
import { ApproveSectionOneWeekComponent } from '@reports/components/incident-metrics/mean-time-to-approve/approve-section-one-week/approve-section-one-week.component';

import { ApproveMultipleSectionsOneMonthComponent } from '@reports/components/incident-metrics/mean-time-to-approve/approve-multiple-sections-one-month/approve-multiple-sections-one-month.component';
import { ApproveOneSectionMultipleMonthsComponent } from '@reports/components/incident-metrics/mean-time-to-approve/approve-one-section-multiple-months/approve-one-section-multiple-months.component';
import { ApproveOneSectionOneMonthComponent } from '@reports/components/incident-metrics/mean-time-to-approve/approve-one-section-one-month/approve-one-section-one-month.component';
import { ApproveOneSectionOneWeekComponent } from '@reports/components/incident-metrics/mean-time-to-approve/approve-one-section-one-week/approve-one-section-one-week.component';

// mttr
import { MttrMultipleSectionsComponent } from '@reports/components/incident-metrics/mean-time-to-repair/mttr-multiple-sections/mttr-multiple-sections.component';
import { MttrSectionOneMonthComponent } from '@reports/components/incident-metrics/mean-time-to-repair/mttr-section-one-month/mttr-section-one-month.component';
import { MttrSectionMultipleMonthsComponent } from '@reports/components/incident-metrics/mean-time-to-repair/mttr-section-multiple-months/mttr-section-multiple-months.component';
import { MttrSectionOneWeekComponent } from '@reports/components/incident-metrics/mean-time-to-repair/mttr-section-one-week/mttr-section-one-week.component';

// mtbf
import { MtbfMultipleSectionsComponent } from '@reports/components/incident-metrics/mean-time-before-failure/mtbf-multiple-sections/mtbf-multiple-sections.component';
import { MtbfSectionMultipleMonthsComponent } from '@reports/components/incident-metrics/mean-time-before-failure/mtbf-section-multiple-months/mtbf-section-multiple-months.component';
import { MtbfSectionOneMonthComponent } from '@reports/components/incident-metrics/mean-time-before-failure/mtbf-section-one-month/mtbf-section-one-month.component';
import { MtbfSectionOneWeekComponent } from '@reports/components/incident-metrics/mean-time-before-failure/mtbf-section-one-week/mtbf-section-one-week.component';


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
  ApproveMultipleSectionsOneMonthComponent,
  ApproveOneSectionMultipleMonthsComponent,
  ApproveOneSectionOneMonthComponent,
  ApproveOneSectionOneWeekComponent,
];

export const acknowlegeMetricsComponents = [
  AcknowledgeMultipleSectionsComponent,
  AcknowledgeSectionOneMonthComponent,
  AcknowledgeSectionMultipleMonthsComponent,
  AcknowledgeSectionOneWeekComponent
];

export const approveMetricsComponents = [
  ApproveMultipleSectionsComponent,
  ApproveSectionMultipleMonthsComponent,
  ApproveSectionOneMonthComponent,
  ApproveSectionOneWeekComponent
];

export const mttrMetricsComponents = [
  MttrMultipleSectionsComponent,
  MttrSectionOneMonthComponent,
  MttrSectionMultipleMonthsComponent,
  MttrSectionOneWeekComponent
];

export const mtbfMetricsComponents = [
  MtbfMultipleSectionsComponent,
  MtbfSectionMultipleMonthsComponent,
  MtbfSectionOneMonthComponent,
  MtbfSectionOneWeekComponent
];
