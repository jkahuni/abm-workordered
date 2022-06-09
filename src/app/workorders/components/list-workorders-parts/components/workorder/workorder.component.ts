import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';

import { IntSpareWithQuantities, IntWorkorder } from '@workorders/models/workorders.models';
import { WorkordersService } from '@workorders/services/workorders.service';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-workorder',
  templateUrl: './workorder.component.html',
  styleUrls: ['./workorder.component.scss'],
})
export class WorkorderComponent implements OnInit, OnChanges {

  constructor(
    private fb: FormBuilder,
    private toast: HotToastService,
    private workordersService: WorkordersService
  ) { }

  @Input()
  workorder!: IntWorkorder;

  @Input('user')
  userType!: string | null;

  @Output() updateWorkorder: EventEmitter<string> = new EventEmitter<string>();

  allowedUsers: string[] = ['engineering', 'stores', 'supervisor', 'manager'];

  form!: FormGroup;
  workorders!: IntWorkorder[];
  workorderEscalationTimeouts: any = {};

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const newWorkorder = changes['workorder']?.currentValue as IntWorkorder;
    this.updateWorkorderViewStatus(newWorkorder);
    this.createForm(newWorkorder);
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
      dateEscalated: [this.formatDate(workorder.escalated?.dateTime)],
      timeEscalated: [this.formatTime(workorder.escalated?.dateTime)],
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
      const { code, quantity, totalCost, name} = spare;
      const form = this.fb.group({
        code,
        quantity,
        totalCost,
        name
      });
      sparesArray.push(form);
    });

    return sparesArray;
  }

  private formatDate(dateTime: string | undefined): string {
    return dayjs(dateTime).format('DD MMM, YYYY');
  }

  private formatTime(dateTime: string | undefined): string {
    return dayjs(dateTime).format('HH:mm:ss');
  }

  private updateWorkordersArray(uid: string, update: {}): void {
    this.workordersService.refreshWorkorders(uid, update)
      .then(() => this.updateWorkorder.emit(uid));
  }

  private updateWorkorderViewStatus(workorder: IntWorkorder): void {
    if (this.userType === 'engineering') {
      const workorderUid = workorder.workorder.uid;
      const workorderType = workorder.workorder.type;
      const workorderNumber = workorder.workorder.number;
      const escalated = workorder.escalated?.status;

      const viewed = workorder.viewedByTechnician.status;

      const now = dayjs().format();
      const acknowledged = workorder.acknowledged.status;

      // update view status first
      if (!viewed) {
        const workorderUpdateData = {
          viewedByTechnician: {
            status: true,
            dateTime: now
          }
        };

        this.workordersService.updateWorkorder(workorderUid, workorderUpdateData)
          .then(() => {
            this.updateWorkordersArray(workorderUid, workorderUpdateData);
            this.toast.info(`Acknowledge or handover <b>${workorderType}</b> workorder <b>${workorderNumber
              }</b> within 3 minutes, failure to which the workorder will be escalated to the supervisor. Please note that once you acknowledge you cannot handover.`, { duration: 60000 });
          });

      }
      else if (viewed) {
        if (!acknowledged && !this.workorderEscalationTimeouts[workorderUid] && !escalated) {
          this.scheduleWorkorderEscalation(workorder);
        }

        else if (!acknowledged && this.workorderEscalationTimeouts[workorderUid] && escalated) {
          delete (this.workorderEscalationTimeouts[workorderUid]);
        }

        else if (acknowledged && this.workorderEscalationTimeouts[workorderUid]) {
          clearTimeout(this.workorderEscalationTimeouts[workorderUid]);
          delete (this.workorderEscalationTimeouts[workorderUid]);
        }
      }

    }
  }

  private scheduleWorkorderEscalation(workorder: IntWorkorder): any {
    const allowedTime: number = 3;
    const workorderUid = workorder.workorder.uid;
    const workorderType = workorder.workorder.type;
    const workorderNumber = workorder.workorder.number;

    const now = dayjs().format();

    const viewedTime = dayjs(workorder.viewedByTechnician.dateTime);

    const timeDifference = dayjs(now).diff(viewedTime, 'minutes', false);

    const delay = timeDifference < allowedTime ? 1000 * 60 * (allowedTime - timeDifference) : 0;

    this.workorderEscalationTimeouts[workorderUid] = setTimeout(() => {
      const workorderUpdateData = {
        escalated: {
          status: true,
          dateTime: dayjs().format(),
          technicianNotified: true
        }
      };

      this.workordersService.updateWorkorder(workorderUid, workorderUpdateData)
        .then(() => {
          this.updateWorkordersArray(workorderUid, workorderUpdateData);
          this.toast.error(`You have exceeded the allowed time to acknowledge or handover <b>${workorderType
            }</b> workorder <b>${workorderNumber
            }</b>. The workorder has been escalated to the supervisor.`, { autoClose: false });
        });
    }, delay);
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
