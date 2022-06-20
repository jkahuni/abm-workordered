import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ResourcesRoutingModule,
  rootResourcesComponent,
  addResourcesComponents,
  editResourcesComponents
} from '@resources/resources-routing.module';
import { SharedModule } from '@shared/shared.module';
import { AddResourcesComponent } from '@resources/components/add-resources/add-resources.component';
import { EditResourcesComponent } from '@resources/components/edit-resources/edit-resources.component';



@NgModule({
  declarations: [
    rootResourcesComponent,
    addResourcesComponents,
    editResourcesComponents,
    AddResourcesComponent,
    EditResourcesComponent,
  ],
  imports: [
    CommonModule,
    ResourcesRoutingModule,
    SharedModule
  ],
  exports: [
    addResourcesComponents,
    editResourcesComponents
  ]
})
export class ResourcesModule { }
