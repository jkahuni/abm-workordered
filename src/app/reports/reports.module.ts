import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@angular/cdk/layout';

import { ReportsRoutingModule } from '@reports/reports-routing.module';
import { NgChartsModule } from 'ng2-charts';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

// components
import { ReportsComponent } from '@reports/reports.component';
import { MaintenanceCostComponent } from '@reports/components/maintenance-cost/maintenance-cost.component';


@NgModule({
  declarations: [
    MaintenanceCostComponent,
    ReportsComponent
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
    LayoutModule
  ],
  exports: [MaintenanceCostComponent]
})
export class ReportsModule { }
