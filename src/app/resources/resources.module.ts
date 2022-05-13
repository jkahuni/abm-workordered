import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ResourcesRoutingModule,
  rootResourcesComponent,
  addResourcesComponents,
  editResourcesComponents
} from '@resources/resources-routing.module';
import { SharedModule } from '@shared/shared.module';



@NgModule({
  declarations: [
    rootResourcesComponent,
    addResourcesComponents,
    editResourcesComponents,
  ],
  imports: [
    CommonModule,
    ResourcesRoutingModule,
    SharedModule
  ]
})
export class ResourcesModule { }
