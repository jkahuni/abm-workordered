import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResourcesComponent } from '@resources/resources.component';
import { AddSectionComponent } from '@resources/components/add-resources/add-section/add-section.component';
import { AddMachineComponent } from '@resources/components/add-resources/add-machine/add-machine.component';
import { AddSpareComponent } from '@resources/components/add-resources/add-spare/add-spare.component';
import { EditSpareComponent } from '@resources/components/edit-resources/edit-spare/edit-spare.component';
import { EditSectionComponent } from '@resources/components/edit-resources/edit-section/edit-section.component';
import { EditMachineComponent } from '@resources/components/edit-resources/edit-machine/edit-machine.component';
import { AddResourcesComponent } from '@resources/components/add-resources/add-resources.component';
import { EditResourcesComponent } from '@resources/components/edit-resources/edit-resources.component';

// stock
import { StockSheetComponent } from './components/stock-sheet/stock-sheet.component';


// firebase auth guards
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

const redirectToLogin = () => redirectUnauthorizedTo(['authentication/sign-in']);


const routes: Routes = [
  {
    path: '', component: ResourcesComponent,
    ...canActivate(redirectToLogin),
    children: [
      {
        path: 'add-resources', component: AddResourcesComponent,
        ...canActivate(redirectToLogin)
      },
      {
        path: 'edit-resources', component: EditResourcesComponent,
        ...canActivate(redirectToLogin)
      }
      ,
      {
        path: 'stock-sheet', component: StockSheetComponent,
        ...canActivate(redirectToLogin)
      }
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResourcesRoutingModule { }

export const rootResourcesComponent = [
  ResourcesComponent
];

export const addResourcesComponents = [
  AddSectionComponent,
  AddMachineComponent,
  AddSpareComponent
];

export const editResourcesComponents = [
  EditSpareComponent,
  EditSectionComponent,
  EditMachineComponent
];
