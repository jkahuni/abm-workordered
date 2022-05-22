import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';

import {
  WorkordersRoutingModule,
  raiseWorkorderComponents,
  closeWorkorderComponents,
  workordersComponents,
  exportableComponents
} from '@workorders/workorders-routing.module';

import { CurrencyPipe } from '@angular/common';

// pipes and directives
import { FormatWorkorderNumberPipe } from '@workorders/directives/format-workorder-number/format-workorder-number.pipe';
import { MachinesFilterPipe } from '@workorders/directives/machines-filter/machines-filter.pipe';
import { SectionsFilterPipe } from '@workorders/directives/sections-filter/sections-filter.pipe';
import { ValidateMixedFormatDirective } from '@workorders/directives/validate-mixed-format/validate-mixed-format.directive';

@NgModule({
  declarations: [
    FormatWorkorderNumberPipe,
    MachinesFilterPipe,
    SectionsFilterPipe,
    ValidateMixedFormatDirective,

    // components
    raiseWorkorderComponents,
    closeWorkorderComponents,
    workordersComponents,
    exportableComponents
  ],
  imports: [
    CommonModule,
    WorkordersRoutingModule,
    SharedModule,
  ],
  providers: [CurrencyPipe],
  exports: [
    exportableComponents]
})
export class WorkordersModule { }
