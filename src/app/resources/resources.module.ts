import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ResourcesRoutingModule, rootResourcesComponent,
addResourcesComponents,
editResourcesComponents
} from '@resources/resources-routing.module';


@NgModule({
  declarations: [
    rootResourcesComponent,
    addResourcesComponents,
    editResourcesComponents
  ],
  imports: [
    CommonModule,
    ResourcesRoutingModule
  ]
})
export class ResourcesModule { }
