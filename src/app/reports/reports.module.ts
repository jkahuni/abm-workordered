import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { ReportsRoutingModule, childrenComponents } from '@reports/reports-routing.module';
import { NgChartsModule } from 'ng2-charts';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

// components
import { ReportsComponent } from '@reports/reports.component';



@NgModule({
  declarations: [
    ReportsComponent,
    childrenComponents
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
    MatSlideToggleModule
  ],
  exports: [childrenComponents]
})
export class ReportsModule { }
