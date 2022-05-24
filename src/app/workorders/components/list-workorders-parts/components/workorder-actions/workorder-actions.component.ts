import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, SimpleChanges, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { IntWorkorder } from '@workorders/models/workorders.models';
import { WorkordersService } from '@workorders/services/workorders.service';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-workorder-actions',
  templateUrl: './workorder-actions.component.html',
  styleUrls: ['./workorder-actions.component.scss']
})
export class WorkorderActionsComponent implements OnInit, OnChanges {

  constructor(
    private toast: HotToastService,
    private router: Router,
    private workordersService: WorkordersService
  ) { }

  @Input() selectedWorkorder!: IntWorkorder | undefined;
  @Input() userType!: string | null;
  @Input() userUid!: string | null;
  @Input() workordersType!: string | null;

  @Output() showModal: EventEmitter<string> = new EventEmitter<string>()
  @Output() updateWorkorder: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('appprovingWorkorderButtonSpinner') appprovingWorkorderButtonSpinner!: ElementRef;
  @ViewChild('acknowledgingWorkorderButtonSpinner') acknowledgingWorkorderButtonSpinner!: ElementRef;
  @ViewChild('markingDoneButtonSpinner') markingDoneButtonSpinner!: ElementRef;
  @ViewChild('reviewingWorkorderButtonSpinner') reviewingWorkorderButtonSpinner!: ElementRef;

  workorder!: IntWorkorder;

  // for router links
  workorderUid!: string;

  // for the button spinners
  approvingWorkorder = false;
  acknowledgingWorkorder = false;
  markingDone = false;
  reviewingWorkorder = false;


  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const workorder = changes['selectedWorkorder']?.currentValue as IntWorkorder;
    this.workorder = workorder;
    this.workorderUid = workorder ? workorder.workorder.uid : '';

  }

  private closeWorkorderByType(workorder: IntWorkorder): Promise<boolean> {
    const type = workorder.workorder.type.trim()
      .toLocaleLowerCase()
      .replace(/\s/g, '-');;
    return this.router.navigate([`close-workorder/${type}/${this.userUid}/${this.workorderUid}`]);
  }

  private closeButtonSpinners(): void {
    this.toast.close();
    this.approvingWorkorder = false;
    this.acknowledgingWorkorder = false;
    this.markingDone = false;
    this.reviewingWorkorder = false;

    if (this.appprovingWorkorderButtonSpinner) { this.appprovingWorkorderButtonSpinner.nativeElement.style.display = 'none'; 
  }
    if (this.reviewingWorkorderButtonSpinner) { this.reviewingWorkorderButtonSpinner.nativeElement.style.display = 'none'; 
    }
    if (this.acknowledgingWorkorderButtonSpinner) {
      this.acknowledgingWorkorderButtonSpinner.nativeElement.style.display = 'none';
    }
    if (this.markingDoneButtonSpinner) { this.markingDoneButtonSpinner.nativeElement.style.display = 'none'; 
  }
  }

  private updateWorkordersArray(uid: string, update: {}): void {
    this.workordersService.refreshWorkorders(
      uid, update
    ).then(() => this.updateWorkorder.emit(uid));
  }

  openModal(type: string): any {
    console.log('TYPE in ACTIONS', type);
    return type && type !== '' ?
      this.showModal.emit(type) :
      this.showModal.emit('none');
  }

  // workorder actions errors
  markDoneBeforeAcknowledged() {
    this.toast.close();
    this.toast.info(`You cannnot mark the workorder done before you acknowledge it.`, { id: 'mark-done-before-acknowledged' });
  }

  closeBeforeAcknowledgedOrDone(): void {
    this.toast.close();
    this.toast.info(`You cannot close a workorder that has not been acknowledged and marked as done.`, { id: 'close-before-acknowledged-or-done' });
  }

  handoverAfterAcknowledged(): void {
    this.toast.close();
    this.toast.info(`You have already acknowledged this workorder. You cannot pass it on to someone else.`, { duration: 8000, id: 'handover-after-acknowledged' });
  }

  handoverAfterDone(): void {
    this.toast.close();
    this.toast.info(`You have already acknowledged and marked this workorder as done.
     You cannot hand it over.`,
      { id: 'handover-after-done' });
  }

  // workorder actions
  approve(): void {
    if (this.workorder) {
      this.approvingWorkorder = true;

      const now = dayjs().format();
      const workorderUid = this.workorder.workorder.uid;
      const workorderNumber = this.workorder.workorder.number;

      const workorderUpdateData = {
        approved: {
          status: true,
          dateTime: now
        },
        rejected: { status: false, dateTime: now }

      };
      this.workordersService.updateWorkorder(workorderUid, workorderUpdateData)
        .then(() => {
          this.closeButtonSpinners();
          this.updateWorkordersArray(workorderUid, workorderUpdateData);

          this.toast.success(`Success. Workorder <b>${workorderNumber}</b> approved successfully.`, { id: 'approve-workorder-success' });

        })
        .catch(() => {
          this.closeButtonSpinners();

          this.toast.error(`Failed:
             Approving workorder <b>${workorderNumber}</b> failed with error code <b>LW-ApW-04</b>. Please try again, or report the error code to support if the issue persists.`,
            { autoClose: false, id: 'error-code-WL-04' });
        });
    }
  }

  acknowledge(): void {
    if (this.workorder) {
      this.acknowledgingWorkorder = true;
      const workorderUid = this.workorder.workorder.uid;
      const workorderNumber = this.workorder.workorder.number;
      const now = dayjs().format();

      const workorderUpdateData = {
        acknowledged: {
          status: true,
          dateTime: now
        }
      };

      this.workordersService.updateWorkorder(workorderUid, workorderUpdateData)
        .then(() => {
          this.closeButtonSpinners();
          this.updateWorkordersArray(workorderUid, workorderUpdateData);
          this.toast.success(`Success. Workorder <b>${workorderNumber}</b> acknowledged successfully.`, { id: 'acknowledge-workorder-success' });
        })
        .catch(() => {
          this.closeButtonSpinners();
          this.toast.error(`Failed. Acknowleding workorder <b>${workorderNumber}</b> failed with error code <b>LW-AckW-01</b>. Please try again or report this error code to support for assistance if the issue persists.`, {
            autoClose: false, id: 'error-code-WL-09'
          });
        });

    }
  }

  markDone(): void {
    if (this.workorder) {
      this.markingDone = true;
      const workorderNumber = this.workorder.workorder.number;
      const workorderUid = this.workorder.workorder.uid;

      const now = dayjs().format();
      const datetimeRaised = dayjs(this.workorder.raised.dateTime);
      const dateTimeApproved = dayjs(this.workorder.approved.dateTime);
      const dateTimeAcknowledged = dayjs(this.workorder.acknowledged.dateTime);

      // getting time differences
      const fromTimeRaised = Math.round(dayjs(now).diff(datetimeRaised, 'minutes', true));
      const fromTimeApproved = Math.round(dayjs(now).diff(dateTimeApproved, 'minutes', true));
      const fromTimeAcknowledged = Math.round(dayjs(now).diff(dateTimeAcknowledged, 'minutes', true));
      const fromTimeMachineStopped = this.workorder.breakdown.status ? Math.round(dayjs(now).diff(dayjs(this.workorder.breakdown.dateTime), 'minutes', true)) : '';

      const workorderUpdateData = {
        done: {
          status: true,
          dateTime: now
        },
        timeTaken: {
          fromTimeMachineStopped,
          fromTimeRaised,
          fromTimeApproved,
          fromTimeAcknowledged
        }
      };
      this.workordersService.updateWorkorder(workorderUid, workorderUpdateData)
        .then(() => {
          this.closeButtonSpinners();
          this.updateWorkordersArray(workorderUid, workorderUpdateData);
          this.toast.success(`Success. Workorder <b>${workorderNumber}</b> marked as done. Click on the workorder to view the time taken.`, { id: 'mark-workorder-done-success' });
        })
        .catch(() => {
          this.closeButtonSpinners();
          this.toast.error(`Failed. Marking workorder <b>${workorderNumber}</b> as done failed with error code <b>LW-MWD-01</b>. Please try again or report this error code to support for assistance if the issue persists.`, {
            autoClose: false, id: 'error-code-WL-10'
          });
        });
    }
  }

  close(workorder: IntWorkorder): void {
    this.closeWorkorderByType(workorder);
  }

  // ENG MANAGER ACTIONS
  reviewWorkorder(): void {
    if (this.workorder) {
      this.reviewingWorkorder = true;
      const now = dayjs().format();
      const workorderUid = this.workorder.workorder.uid;
      const workorderNumber = this.workorder.workorder.number;
      const workorderUpdateData = {
        review: {
          status: 'reviewed',
          concerns: [],
          dateTime: now

        }
      };

      this.workordersService.updateWorkorder(workorderUid, workorderUpdateData)
        .then(() => {
          this.closeButtonSpinners();
          this.updateWorkordersArray(workorderUid, workorderUpdateData);
          this.toast.success(`Success. Workorder <b>${workorderNumber}</b> reviewed successfully.`, { id: 'review-workorder-success' });
        })
        .catch(() => {
          this.closeButtonSpinners();
          this.toast.error(`Failed. Reviewing workorder <b>${workorderNumber}</b> failed with error code <b>LW-RSW-01</b>. Please try again or report the error code to support to have the issue fixed.`, { autoClose: false, id: 'review-workorder-error' });
        });
    }
  }
}
