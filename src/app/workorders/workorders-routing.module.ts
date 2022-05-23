import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// workorders components
import { RaiseWorkorderComponent } from '@workorders/components/raise-workorder/raise-workorder.component';
import { ListWorkordersComponent } from '@workorders/components/list-workorders/list-workorders.component';
import { IssueSparesComponent } from '@workorders/components/issue-spares/issue-spares.component';
import { CloseWorkorderComponent } from '@workorders/components/close-workorder/close-workorder.component';


// raise w/o components
import { RaiseAbnormalityCardComponent } from '@workorders/components/raise-workorder/components/raise-abnormality-card/raise-abnormality-card.component';
import { RaiseAmComponent } from '@workorders/components/raise-workorder/components/raise-am/raise-am.component';
import { RaiseBreakdownComponent } from '@workorders/components/raise-workorder/components/raise-breakdown/raise-breakdown.component';
import { RaiseCorrectiveMaintenanceComponent } from '@workorders/components/raise-workorder/components/raise-corrective-maintenance/raise-corrective-maintenance.component';
import { RaiseKaizenCardComponent } from '@workorders/components/raise-workorder/components/raise-kaizen-card/raise-kaizen-card.component';
import { RaiseMoldServiceComponent } from '@workorders/components/raise-workorder/components/raise-mold-service/raise-mold-service.component';
import { RaisePmComponent } from '@workorders/components/raise-workorder/components/raise-pm/raise-pm.component';
import { RaiseProjectComponent } from '@workorders/components/raise-workorder/components/raise-project/raise-project.component';
import { RaiseServiceComponent } from '@workorders/components/raise-workorder/components/raise-service/raise-service.component';
import { RaiseToolChangeComponent } from '@workorders/components/raise-workorder/components/raise-tool-change/raise-tool-change.component';
import { NewWorkorderComponent } from '@workorders/components/raise-workorder/components/new-workorder/new-workorder.component';


// close w/o components
import { CloseAbnormalityCardComponent } from '@workorders/components/close-workorder/components/close-abnormality-card/close-abnormality-card.component';
import { CloseAmComponent } from '@workorders/components/close-workorder/components/close-am/close-am.component';
import { CloseBreakdownComponent } from '@workorders/components/close-workorder/components/close-breakdown/close-breakdown.component';
import { CloseCorrectiveMaintenanceComponent } from '@workorders/components/close-workorder/components/close-corrective-maintenance/close-corrective-maintenance.component';
import { CloseKaizenCardComponent } from '@workorders/components/close-workorder/components/close-kaizen-card/close-kaizen-card.component';
import { CloseMoldServiceComponent } from '@workorders/components/close-workorder/components/close-mold-service/close-mold-service.component';
import { ClosePmComponent } from '@workorders/components/close-workorder/components/close-pm/close-pm.component';
import { CloseProjectComponent } from '@workorders/components/close-workorder/components/close-project/close-project.component';
import { CloseServiceComponent } from '@workorders/components/close-workorder/components/close-service/close-service.component';
import { CloseToolChangeComponent } from '@workorders/components/close-workorder/components/close-tool-change/close-tool-change.component';

// exportable components
import { WorkorderComponent } from '@workorders/components/list-workorders-parts/components/workorder/workorder.component';
import { HelpModalComponent } from '@workorders/components/list-workorders-parts/components/help-modal/help-modal.component';
import { RejectWorkorderModalComponent } from '@workorders/components/list-workorders-parts/components/reject-workorder-modal/reject-workorder-modal.component';
import { SupervisorsHandoverModalComponent } from '@workorders/components/list-workorders-parts/components/supervisors-handover-modal/supervisors-handover-modal.component';
import { ChangeTechniciansModalComponent } from '@workorders/components/list-workorders-parts/components/change-technicians-modal/change-technicians-modal.component';
import { AssignTechniciansModalComponent } from '@workorders/components/list-workorders-parts/components/assign-technicians-modal/assign-technicians-modal.component';
import { TechniciansHandoverModalComponent } from '@workorders/components/list-workorders-parts/components/technicians-handover-modal/technicians-handover-modal.component';
import { StoreTechniciansHandoverModalComponent } from '@workorders/components/list-workorders-parts/components/store-technicians-handover-modal/store-technicians-handover-modal.component';
import { ReviewWorkordersModalComponent } from '@workorders/components/list-workorders-parts/components/review-workorders-modal/review-workorders-modal.component';
import { RaiseConcernModalComponent } from '@workorders/components/list-workorders-parts/components/raise-concern-modal/raise-concern-modal.component';
import { WorkorderActionsComponent } from '@workorders/components/list-workorders-parts/components/workorder-actions/workorder-actions.component';
import { WorkorderNumbersComponent } from '@workorders/components/list-workorders-parts/components/workorder-numbers/workorder-numbers.component';



// firebase auth guards
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

const redirectToLogin = () => redirectUnauthorizedTo(['authentication/sign-in']);


const routes: Routes = [
  // workorders list
  {
    path: 'workorders/:userType/:workordersType/:userUid',
    component: ListWorkordersComponent,
    ...canActivate(redirectToLogin)
  },
  // raise
  {
    path: 'new-workorder', component: NewWorkorderComponent,
    ...canActivate(redirectToLogin)
  },
  {
    path: 'raise-workorder',
    component: RaiseWorkorderComponent,
    children: [
      {
        path: 'abnormality-card/:userUid', component: RaiseAbnormalityCardComponent,
        ...canActivate(redirectToLogin)
      },
      {
        path: 'am/:userUid', component: RaiseAmComponent,
        ...canActivate(redirectToLogin)
      },
      {
        path: 'breakdown/:userUid', component: RaiseBreakdownComponent,
        ...canActivate(redirectToLogin)
      },
      {
        path: 'corrective-maintenance/:userUid', component: RaiseCorrectiveMaintenanceComponent,
        ...canActivate(redirectToLogin)
      },
      {
        path: 'kaizen-card/:userUid', component: RaiseKaizenCardComponent,
        ...canActivate(redirectToLogin)
      },
      {
        path: 'mold-service/:userUid', component: RaiseMoldServiceComponent,
        ...canActivate(redirectToLogin)
      },
      {
        path: 'pm/:userUid', component: RaisePmComponent,
        ...canActivate(redirectToLogin)
      },
      {
        path: 'project/:userUid', component: RaiseProjectComponent,
        ...canActivate(redirectToLogin)
      },
      {
        path: 'service/:userUid', component: RaiseServiceComponent,
        ...canActivate(redirectToLogin)
      },
      {
        path: 'tool-change/:userUid', component: RaiseToolChangeComponent,
        ...canActivate(redirectToLogin)
      },
    ],
    ...canActivate(redirectToLogin)
  },
  // close
  {
    path: 'close-workorder',
    component: CloseWorkorderComponent,
    children: [
      {
        path: 'abnormality-card/:userUid/:workorderUid', component: CloseAbnormalityCardComponent,
        ...canActivate(redirectToLogin)
      },
      {
        path: 'am/:userUid/:workorderUid', component: CloseAmComponent,
        ...canActivate(redirectToLogin)
      },
      {
        path: 'breakdown/:userUid/:workorderUid', component: CloseBreakdownComponent,
        ...canActivate(redirectToLogin)
      },
      {
        path: 'corrective-maintenance/:userUid/:workorderUid', component: CloseCorrectiveMaintenanceComponent,
        ...canActivate(redirectToLogin)
      },
      {
        path: 'kaizen-card/:userUid/:workorderUid', component: CloseKaizenCardComponent,
        ...canActivate(redirectToLogin)
      },
      {
        path: 'mold-service/:userUid/:workorderUid', component: CloseMoldServiceComponent,
        ...canActivate(redirectToLogin)
      },
      {
        path: 'pm/:userUid/:workorderUid', component: ClosePmComponent,
        ...canActivate(redirectToLogin)
      },
      {
        path: 'project/:userUid/:workorderUid', component: CloseProjectComponent,
        ...canActivate(redirectToLogin)
      },
      {
        path: 'service/:userUid/:workorderUid', component: CloseServiceComponent,
        ...canActivate(redirectToLogin)
      },
      {
        path: 'tool-change/:userUid/:workorderUid', component: CloseToolChangeComponent,
        ...canActivate(redirectToLogin)
      },
    ],

    ...canActivate(redirectToLogin)
  },
  // issue spares
  {
    path: 'issue-spares/:workorderUid/:userUid/:workordersType',
    component: IssueSparesComponent,
    ...canActivate(redirectToLogin)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkordersRoutingModule { }

export const raiseWorkorderComponents = [
  NewWorkorderComponent,
  RaiseAbnormalityCardComponent,
  RaiseAmComponent,
  RaiseBreakdownComponent,
  RaiseCorrectiveMaintenanceComponent,
  RaiseKaizenCardComponent,
  RaiseMoldServiceComponent,
  RaisePmComponent,
  RaiseProjectComponent,
  RaiseServiceComponent,
  RaiseToolChangeComponent
];

export const closeWorkorderComponents = [
  CloseAbnormalityCardComponent,
  CloseAmComponent,
  CloseBreakdownComponent,
  CloseCorrectiveMaintenanceComponent,
  CloseKaizenCardComponent,
  CloseMoldServiceComponent,
  ClosePmComponent,
  CloseProjectComponent,
  CloseServiceComponent,
  CloseToolChangeComponent
];

export const workordersComponents = [
  RaiseWorkorderComponent,
  ListWorkordersComponent,
  IssueSparesComponent,
  CloseWorkorderComponent
];

export const exportableComponents = [
  WorkorderComponent,
  HelpModalComponent,
  RejectWorkorderModalComponent,
  SupervisorsHandoverModalComponent,
  ChangeTechniciansModalComponent,
  AssignTechniciansModalComponent,
  TechniciansHandoverModalComponent,
  StoreTechniciansHandoverModalComponent,
  ReviewWorkordersModalComponent,
  RaiseConcernModalComponent,
  WorkorderActionsComponent,
  WorkorderNumbersComponent
];
