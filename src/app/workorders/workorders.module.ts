import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';

import {
  WorkordersRoutingModule,
  raiseWorkorderComponents,
  closeWorkorderComponents,
  workordersComponents
} from '@workorders/workorders-routing.module';

import { CurrencyPipe } from '@angular/common';



// pipes and directives
import { FormatWorkorderNumberPipe } from '@workorders/directives/format-workorder-number/format-workorder-number.pipe';
import { MachinesFilterPipe } from '@workorders/directives/machines-filter/machines-filter.pipe';
import { SectionsFilterPipe } from '@workorders/directives/sections-filter/sections-filter.pipe';
import { ValidateMixedFormatDirective } from '@workorders/directives/validate-mixed-format/validate-mixed-format.directive';
import { ValidateSentenceFormatDirective } from '@workorders/directives/validate-sentence-format/validate-sentence-format.directive';

@NgModule({
  declarations: [
    FormatWorkorderNumberPipe,
    MachinesFilterPipe,
    SectionsFilterPipe,
    ValidateMixedFormatDirective,
    ValidateSentenceFormatDirective,

    // components
    raiseWorkorderComponents,
    closeWorkorderComponents,
    workordersComponents,
  ],
  imports: [
    CommonModule,
    WorkordersRoutingModule,
    SharedModule,
  ],
  providers: [CurrencyPipe]
})
export class WorkordersModule { }
