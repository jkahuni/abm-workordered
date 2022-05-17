import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from '@reports/reports-routing.module';
import { NgChartsModule } from 'ng2-charts';
import { MaintenanceCostComponent } from '@reports/components/maintenance-cost/maintenance-cost.component';



@NgModule({
  declarations: [
    MaintenanceCostComponent
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    NgChartsModule
  ],
  exports: [MaintenanceCostComponent]
})
export class ReportsModule { }
