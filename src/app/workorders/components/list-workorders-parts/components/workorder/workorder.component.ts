import { Component, OnInit, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { IntSpareWithQuantities, IntWorkorder } from '@workorders/models/workorders.models';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-workorder',
  templateUrl: './workorder.component.html',
  styleUrls: ['./workorder.component.scss'],
})
export class WorkorderComponent implements OnInit, OnChanges {

  constructor(private fb: FormBuilder) { }


  @Input('workorderToDisplay')
  workorder!: IntWorkorder;

  @Input('user')
  userType!: string | null;

  allowedUsers: string[] = ['engineering', 'stores', 'supervisor', 'manager'];

  form!: FormGroup;

  ngOnInit(): void {
    this.createForm(this.workorder);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.createForm(changes['workorder']?.currentValue)
  }

  private createForm(workorder: IntWorkorder): FormGroup {
    const form = this.fb.group({
      workorderUid: [workorder.workorder.uid],
      workorderNumber: [workorder.workorder.number],
      workorderType: [workorder.workorder.type],
      workorderDescription: [workorder.workorder.description ? workorder.workorder.description :
        'no description provided.'],
      raiser: [workorder.raiser.fullName],
      supervisor: [workorder.supervisor.fullName],
      technician: [workorder.technician.fullName],
      storesTechnician: [workorder.storesTechnician.fullName],
      dateRaised: [this.formatDate(workorder.raised.dateTime)],
      timeRaised: [this.formatTime(workorder.raised.dateTime)],
      dateApproved: [this.formatDate(workorder.approved.dateTime)],
      timeApproved: [this.formatTime(workorder.approved.dateTime)],
      dateRejected: [this.formatDate(workorder.rejected.dateTime)],
      timeRejected: [this.formatTime(workorder.rejected.dateTime)],
      rejectionReason: [workorder.rejected.status ? workorder.rejected.reason : ''],
      breakdownDate: [this.formatDate(workorder.breakdown.dateTime)],
      breakdownTime: [this.formatTime(workorder.breakdown.dateTime)],
      dateAcknowledged: [this.formatDate(workorder.acknowledged.dateTime)],
      timeAcknowledged: [this.formatTime(workorder.acknowledged.dateTime)],
      dateDone: [this.formatDate(workorder.done.dateTime)],
      timeDone: [this.formatTime(workorder.done.dateTime)],
      timeFromTimeRaised: [workorder.timeTaken.fromTimeRaised],
      timeFromTimeApproved: [workorder.timeTaken.fromTimeApproved],
      timeFromTimeAcknowledged: [workorder.timeTaken.fromTimeAcknowledged],
      timeFromTimeMachineStopped: [workorder.timeTaken.fromTimeMachineStopped],
      section: [workorder.section.name],
      machine: [workorder.machine.name],
      toolChangeFrom: [workorder.toolChange.from],
      toolChangeTo: [workorder.toolChange.to],
      moldNumber: [workorder.moldService.number],
      amStep: [workorder.abnormalityCard.amStep],
      sparesUsedStatus: [workorder.sparesUsed.status],
      sparesUsedArray: this.fb.array(workorder.sparesUsed.status ?
        [...this.getIssuedSpares(workorder.sparesUsed.spares)]
        :
        []),
      totalSparesCost: [workorder.sparesUsed.totalCost]
    });

    return this.form = form;
  }

  private getIssuedSpares(spares: IntSpareWithQuantities[]): FormGroup[] {
    const sparesArray: FormGroup[] = [];
    spares.map((spare: IntSpareWithQuantities) => {
      const { code, quantity, totalCost } = spare;
      const form = this.fb.group({
        code,
        quantity,
        totalCost
      });
      sparesArray.push(form);
    });

    return sparesArray;
  }

  private formatDate(dateTime: string): string {
    return dayjs(dateTime).format('DD MMM, YYYY');
  }

  private formatTime(dateTime: string): string {
    return dayjs(dateTime).format('HH:mm:ss');
  }

  // form getters
  get sparesUsedArray(): any {
    return this.form?.get('sparesUsedArray') as FormArray;
  }

  get getTotalSparesCost(): string {
    return this.form?.get('totalSparesCost')?.value;
  }

  // allowed users to see spare costs
  userCanSeeSpareCosts(): boolean {
    return this.userType && this.allowedUsers ?
      this.allowedUsers.includes(this.userType) : false;
  }

}
