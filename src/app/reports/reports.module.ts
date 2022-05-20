import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from '@reports/reports-routing.module';
import { NgChartsModule } from 'ng2-charts';
import { MaintenanceCostComponent } from '@reports/components/maintenance-cost/maintenance-cost.component';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    MaintenanceCostComponent
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    NgChartsModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  exports: [MaintenanceCostComponent]
})
export class ReportsModule { }
