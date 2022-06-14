import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import {
  ReportsRoutingModule,
  maintenanceCostsComponents,
  acknowlegeMetricsComponents,
  approveMetricsComponents,
  mttrMetricsComponents,
  mtbfMetricsComponents
} from '@reports/reports-routing.module';
import { NgChartsModule } from 'ng2-charts';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';

// components
import { ReportsComponent } from '@reports/reports.component';
import { MaintenanceCostComponent } from '@reports/components/maintenance-cost/maintenance-cost.component';
import { IncidentMetricsComponent } from '@reports/components/incident-metrics/incident-metrics.component';

@NgModule({
  declarations: [
    ReportsComponent,
    MaintenanceCostComponent,
    IncidentMetricsComponent,
    maintenanceCostsComponents,
    acknowlegeMetricsComponents,
    approveMetricsComponents,
    mttrMetricsComponents,
    mtbfMetricsComponents
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    NgChartsModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDividerModule
  ],
  exports: [
    maintenanceCostsComponents,
    acknowlegeMetricsComponents,
    approveMetricsComponents,
    mttrMetricsComponents,
    mtbfMetricsComponents
  ]
})
export class ReportsModule { }
