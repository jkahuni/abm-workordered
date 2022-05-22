import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormArray } from '@angular/forms';
import { MatSelect } from '@angular/material/select';

// rxjs
import { takeUntil, Subject } from 'rxjs';

// firestore imports
import {
  DocumentData,
  Firestore, collection,
  CollectionReference
} from '@angular/fire/firestore';

// services
import { WorkordersService } from '@workorders/services/workorders.service';
import { HotToastService } from '@ngneat/hot-toast';

// interfaces
import { IntUser, IntWorkorder } from '@workorders/models/workorders.models';

// dayjs
import * as dayjs from 'dayjs';
import * as weekOfYear from 'dayjs/plugin/weekOfYear';
import * as isToday from 'dayjs/plugin/isToday';
import * as isYesterday from 'dayjs/plugin/isYesterday';

dayjs.extend(weekOfYear);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

@Component({
  selector: 'app-list-workorders',
  templateUrl: './list-workorders.component.html',
  styleUrls: ['./list-workorders.component.scss']
})
export class ListWorkordersComponent implements OnInit, OnDestroy {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestore: Firestore,
    private workordersService: WorkordersService,
    private toast: HotToastService,
  ) { }
  private stopWorkordersListener: Subject<boolean> = new Subject<boolean>();

  // template refs
  @ViewChild('loadingWorkordersSpinner') loadingWorkordersSpinner!: ElementRef;

  // button spinners
  @ViewChild('appprovingWorkorderLoadingSpinner') appprovingWorkorderLoadingSpinner!: ElementRef;
  @ViewChild('rejectWorkorderButtonSpinner') rejectWorkorderButtonSpinner!: ElementRef;
  @ViewChild('delegateSupervisorButtonSpinner') delegateSupervisorButtonSpinner!: ElementRef;
  @ViewChild('changeTechniciansButtonSpinner') changeTechniciansButtonSpinner!: ElementRef;
  @ViewChild('assignTechniciansButtonSpinner') assignTechniciansButtonSpinner!: ElementRef;
  @ViewChild('acknowledgeWorkorderLoadingButtonSpinner') acknowledgeWorkorderLoadingButtonSpinner!: ElementRef;
  @ViewChild('markWorkorderDoneLoadingButtonSpinner') markWorkorderDoneLoadingButtonSpinner!: ElementRef;
  @ViewChild('updateEngineeringTechniciansButtonSpinner') updateEngineeringTechniciansButtonSpinner!: ElementRef;
  @ViewChild('updateStoresTechniciansButtonSpinner') updateStoresTechniciansButtonSpinner !: ElementRef;
  @ViewChild('reviewWorkorderButtonSpinner') reviewWorkorderButtonSpinner!: ElementRef;
  @ViewChild('reviewWorkordersButtonSpinner') reviewWorkordersButtonSpinner!: ElementRef;
  @ViewChild('raiseConcernButtonSpinner') raiseConcernButtonSpinner!: ElementRef;

  // filter workorders options
  @ViewChild('filterWorkordersOptionsField') filterWorkordersOptionsField!: MatSelect;


  // route params
  userType!: string | null;
  workordersType!: string | null;
  userUid!: string | null;

  workorders!: IntWorkorder[];
  workordersToDisplay!: IntWorkorder[];
  workorder!: IntWorkorder | undefined;
  workorderUid!: string;

  // form groups
  form!: FormGroup;
  rejectWorkorderForm!: FormGroup;
  changeTechniciansForm!: FormGroup;
  supervisorsHandoverForm!: FormGroup;
  assignTechniciansForm!: FormGroup;
  engTechniciansHandoverForm!: FormGroup;
  storesTechniciansHandoverForm!: FormGroup;
  reviewWorkordersForm!: FormGroup;
  raiseConcernForm!: FormGroup;

  // for handover templates
  electricalTechnicians!: IntUser[];
  mechanicalTechnicians!: IntUser[];
  storeTechnicians!: IntUser[];
  productionSupervisors!: IntUser[];
  engineeringSupervisors!: IntUser[];
  supervisors!: IntUser[];
  technicians!: IntUser[];

  // showing spares to engineering supervisors
  isEngineeringSupervisor = false;

  // when to show right-sidenav
  workorderHasActions = false;

  // toggle sidenavs
  showLeftSidenav = true;
  showRightSidenav = false;

  // for filtering workorders
  showWorkordersFilterOptions = false;

  // loading spinners
  loadingWorkorders = true;
  loadingWorkordersFailed = false;
  loadingWorkordersIndexingError!: string;
  loadingWorkordersOtherError!: string;
  loadingWorkordersDefaultError: string = `
  Loading workorders failed with error code ULW-01. Try reloading the page or report the error code to support to have it fixed.`;


  // toggle button spinner conditions
  approveWorkorderLoading = false;
  rejectWorkorderLoading = false;
  supervisorHandoverLoading = false;
  changeTechniciansLoading = false;
  assignTechniciansLoading = false;
  acknowledgeWorkorderLoading = false;
  markWorkorderDoneLoading = false;
  engTechnicianHandoverLoading = false;
  storesTechnicianHandoverLoading = false;
  reviewingWorkorder = false;
  reviewingWorkorders = false;
  raisingConcern = false;

  // for showing the filter option
  filterOption!: string;

  // FOR THE UPDATES
  showHelpModal = false;
  showRejectWorkorderModal = false;
  showSupervisorsHandoverModal = false;
  showChangeTechniciansModal = false;
  showAssignTechniciansModal = false;
  showEngTechnicianHandoverModal = false;
  showStoreTechnicianHandoverModal = false;
  showReviewWorkordersModal = false;
  showRaiseConcernsModal = false;

  ngOnDestroy(): void {
    this.stopWorkordersListener.next(true);
    this.stopWorkordersListener.complete();
  }

  ngOnInit(): void {
    this.userType = this.route.snapshot.paramMap.get('userType');
    this.workordersType = this.route.snapshot.paramMap.get('workordersType');
    this.userUid = this.route.snapshot.paramMap.get('userUid');

    this.getWorkorders();
    this.getUsers();
  }

  // create query
  private filterWorkordersByUser(workorders: IntWorkorder[]): IntWorkorder[] | undefined {
    const workordersColRef: CollectionReference<DocumentData> = collection(this.firestore, 'workorders');
    if (
      this.userType &&
      this.workordersType &&
      this.userUid
    ) {
      // manager
      if (this.userType === 'manager') {
        if (this.workordersType === 'reviewed') {
          const reviewedWorkorders = workorders.filter(
            (workorder: IntWorkorder) => {
              const reviewed = workorder.review.status;
              if (reviewed) {
                return true;
              }
              return false;
            });

          return reviewedWorkorders;

        }

        else if (this.workordersType === 'un-reviewed') {
          const unReviewedWorkorders = workorders.filter(
            (workorder: IntWorkorder) => {
              const reviewed = workorder.review.status;
              if (reviewed === '') {
                return true;
              }
              return false;

            });
          this.workorderHasActions = true;
          return unReviewedWorkorders;

        }
      }

      // supervisor
      else if (this.userType === 'supervisor') {
        // unverified workorders
        if (this.workordersType === 'unverified') {
          const unverifiedWorkorders = workorders.filter(
            (workorder: IntWorkorder) => {
              const approved = workorder.approved.status;
              const rejected = workorder.rejected.status;
              const supervisor = workorder.supervisor.uid;

              if (
                !approved &&
                !rejected &&
                supervisor === this.userUid) {
                return true;
              }
              return false;
            }
          );

          this.workorderHasActions = true;
          return unverifiedWorkorders;
        }

        // approved workorders
        else if (this.workordersType === 'approved') {
          const approvedWorkorders = workorders.filter(
            (workorder: IntWorkorder) => {
              const approved = workorder.approved.status;
              const rejected = workorder.rejected.status;
              const supervisor = workorder.supervisor.uid;

              if (
                approved &&
                !rejected &&
                supervisor === this.userUid) {
                return true;
              }

              return false;

            }
          );

          return approvedWorkorders;

        }

        // rejected workorders
        else if (this.workordersType === 'rejected') {
          const rejectedWorkorders = workorders.filter(
            (workorder: IntWorkorder) => {
              const approved = workorder.approved.status;
              const rejected = workorder.rejected.status;
              const supervisor = workorder.supervisor.uid;

              if (
                !approved &&
                rejected &&
                supervisor === this.userUid) {
                return true;
              }
              return false;
            });

          return rejectedWorkorders;

        }

        // raised workorders
        else if (this.workordersType === 'raised') {
          const raisedWorkorders = workorders.filter(
            (workorder: IntWorkorder) => {
              const raiser = workorder.raiser.uid;

              if (raiser === this.userUid) {
                return true;
              }

              return false;
            }
          );

          return raisedWorkorders;

        }
      }
      // engineering technician
      else if (this.userType === 'engineering') {
        // eng open workorders
        if (this.workordersType === 'open') {
          const openWorkorders = workorders.filter
            ((workorder: IntWorkorder) => {
              const approved = workorder.approved.status;
              const rejected = workorder.rejected.status;
              const closed = workorder.closed.status;
              const technician = workorder.technician.uid;

              if (
                approved &&
                !rejected &&
                !closed &&
                technician === this.userUid
              ) {
                return true;
              }

              return false;
            });

          this.workorderHasActions = true;
          return openWorkorders;
        }

        // eng closed workorders
        else if (this.workordersType === 'closed') {
          const closedWorkorders = workorders.filter
            ((workorder: IntWorkorder) => {
              const approved = workorder.approved.status;
              const rejected = workorder.rejected.status;
              const closed = workorder.closed.status;
              const technician = workorder.technician.uid;

              if (
                approved &&
                !rejected &&
                closed &&
                technician === this.userUid
              ) {
                return true;
              }

              return false;
            });

          return closedWorkorders;
        }

      }

      else if (this.userType === 'stores') {
        if (this.workordersType === 'open') {
          const openWorkorders = workorders.filter
            ((workorder: IntWorkorder) => {
              const approved = workorder.approved.status;
              const rejected = workorder.rejected.status;
              const closed = workorder.closed.status;
              const technician = workorder.storesTechnician.uid;

              if (
                approved &&
                !rejected &&
                !closed &&
                technician === this.userUid
              ) {
                return true;
              }

              return false;
            });

          this.workorderHasActions = true;
          return openWorkorders;
        }

        // stores closed workorders
        else if (this.workordersType === 'closed') {
          const closedWorkorders = workorders.filter
            ((workorder: IntWorkorder) => {
              const approved = workorder.approved.status;
              const rejected = workorder.rejected.status;
              const closed = workorder.closed.status;
              const technician = workorder.storesTechnician.uid;

              if (
                approved &&
                !rejected &&
                closed &&
                technician === this.userUid
              ) {
                return true;
              }

              return false;
            });

          this.workorderHasActions = true;
          return closedWorkorders;
        }

      }
      // other types of users
      // (operator, offices, distribution)
      else if (this.userType === 'other') {
        if (this.workordersType === 'raised') {
          const raisedWorkorders = workorders.filter(
            (workorder: IntWorkorder) => {
              const raiser = workorder.raiser.uid;

              if (raiser === this.userUid) {
                return true;
              }

              return false;
            }
          );

          return raisedWorkorders;
        }

        else if (this.workordersType === 'approved') {
          const approvedWorkorders = workorders.filter(
            (workorder: IntWorkorder) => {
              const approved = workorder.approved.status;
              const rejected = workorder.rejected.status;
              const raiser = workorder.raiser.uid;

              if (
                approved &&
                !rejected &&
                raiser === this.userUid) {
                return true;
              }

              return false;
            });

          return approvedWorkorders;
        }

        else if (this.workordersType === 'rejected') {
          const rejectedWorkorders = workorders.filter(
            (workorder: IntWorkorder) => {
              const approved = workorder.approved.status;
              const rejected = workorder.rejected.status;
              const raiser = workorder.raiser.uid;

              if (
                !approved &&
                rejected &&
                raiser === this.userUid) {
                return true;
              }

              return false;
            });

          return rejectedWorkorders;
        }
      }
    }
    return;
  }

  // get workorders
  private getWorkorders(): void {
    console.log('LW METHOD CALLED');
    this.workordersService.$allWorkorders
      .pipe(takeUntil(this.stopWorkordersListener))
      .subscribe(
        (workorders: IntWorkorder[] | null) => {
          if (workorders !== null) {
            const filteredWorkorders = this.filterWorkordersByUser(workorders);

            if (filteredWorkorders) {
              this.workorders = filteredWorkorders;
              this.workordersToDisplay = this.workorders;
              console.log('INSIDE LW METHOD SUBSCRIBE', this.workorders);

              this.hideLoadingWorkordersSpinner();
            } else {
              this.hideLoadingWorkordersSpinnerOnError();
              this.loadingWorkordersOtherError = `Loading workorders failed with error code FAW-LW-01. Please try reloading the page or report this error code to support to have it fixed.`;
            }
          }

          else {
            this.workordersService.getAllWorkorders()
              .then(() => {
                // this.getWorkorders();
              })
              .catch((err: any) => {
                this.hideLoadingWorkordersSpinnerOnError();
                if (err.code === 'failed-precondition') {
                  this.loadingWorkordersIndexingError = `Loading workorders failed with error code IND-LW-01. Please report this error code to support to have it fixed.`;

                } else {
                  this.loadingWorkordersOtherError = `Loading workorders failed with error code LW-01. Please try reloading the page or report this error code to support to have it fixed.`;
                }
              });
          }
        }
      );

  }

  // get all users
  private getUsers(): void {
    this.workordersService.getUsers()
      .then((users: IntUser[]) => {
        this.productionSupervisors = users.filter(
          (user: IntUser) =>
            user.group === 'Supervisor' && user.supervisorGroup === 'Production'
        );
        this.engineeringSupervisors = users.filter(
          (user: IntUser) =>
            user.group === 'Supervisor' && user.supervisorGroup === 'Engineering'
        );

        this.supervisors = users.filter((user: IntUser) => user.group === 'Supervisor'
        );

        this.technicians = users.filter(
          (user: IntUser) =>
            user.group === 'Technician'
        );

        this.electricalTechnicians = users.filter(
          (user: IntUser) =>
            user.group === 'Technician' && user.technicianGroup === 'Electrical');
        this.mechanicalTechnicians = users.filter(
          (user: IntUser) =>
            user.group === 'Technician' && user.technicianGroup === 'Mechanical');
        this.storeTechnicians = users.filter(
          (user: IntUser) => user.group === 'Technician' && user.technicianGroup === 'Eng. Store'
            || user.technicianGroup === 'PM Planning'
        );

        const engineeringSupervisor = this.engineeringSupervisors.find((user: IntUser) => user.uid === this.userUid);

        if (engineeringSupervisor !== undefined) {
          this.isEngineeringSupervisor = true;
        }

      })
      .catch(() => {
        this.toast.close();
        this.toast.error(`Error: A crucial operation failed with error code LW-GU-01. Please reload the page or report the error code to support to have it fixed.`,
          { autoClose: false, id: 'error-code-WL-03' });
      });
  }

  // hide spinners
  private hideLoadingWorkordersSpinner(): void {
    this.loadingWorkorders = false;
    if (this.loadingWorkordersSpinner) {
      this.loadingWorkordersSpinner.nativeElement.style.display = 'none';
    }
  }

  private hideLoadingWorkordersSpinnerOnError(): void {
    this.loadingWorkordersFailed = true;
    this.hideLoadingWorkordersSpinner();

  }

  // create forms
  // refresh all workorders
  private refreshWorkorders(uid: string, update: {}): void {
    this.workordersService.refreshWorkorders(uid, update)
      .then(() => {
        const workorder = this.workorders?.find((workorder: IntWorkorder) => workorder.workorder.uid === uid);
        console.log('THE WORKORDER', this.workorder);
        if (workorder) { this.workorder = workorder; }

        else {
          this.closeRightSidenav();
          this.showLeftSidenav = true;
        }

      });

  }

  private closeButtonSpinners(): void {
    this.toast.close();
    this.approveWorkorderLoading = false;
    this.rejectWorkorderLoading = false;
    this.supervisorHandoverLoading = false;
    this.changeTechniciansLoading = false;
    this.assignTechniciansLoading = false;
    this.acknowledgeWorkorderLoading = false;
    this.markWorkorderDoneLoading = false;
    this.engTechnicianHandoverLoading = false;
    this.storesTechnicianHandoverLoading = false;
    this.reviewingWorkorder = false;
    this.reviewingWorkorders = false;
    this.raisingConcern = false;

    if (this.appprovingWorkorderLoadingSpinner) {
      this.appprovingWorkorderLoadingSpinner.nativeElement.style.display = 'none';
    }
    if (this.rejectWorkorderButtonSpinner) {
      this.rejectWorkorderButtonSpinner.nativeElement.style.display = 'none';
    }
    if (this.delegateSupervisorButtonSpinner) {
      this.delegateSupervisorButtonSpinner.nativeElement.style.display = 'none';
    }
    if (this.changeTechniciansButtonSpinner) {
      this.changeTechniciansButtonSpinner.nativeElement.style.display = 'none';
    }
    if (this.assignTechniciansButtonSpinner) {
      this.assignTechniciansButtonSpinner.nativeElement.style.display = 'none';
    }
    if (this.acknowledgeWorkorderLoadingButtonSpinner) {
      this.acknowledgeWorkorderLoadingButtonSpinner.nativeElement.style.display = 'none';
    }
    if (this.markWorkorderDoneLoadingButtonSpinner) {
      this.markWorkorderDoneLoadingButtonSpinner.nativeElement.style.display = 'none';
    }
    if (this.updateEngineeringTechniciansButtonSpinner) {
      this.updateEngineeringTechniciansButtonSpinner.nativeElement.style.display = 'none';
    }
    if (this.updateStoresTechniciansButtonSpinner) {
      this.updateStoresTechniciansButtonSpinner.nativeElement.style.display = 'none';
    }

    if (this.reviewWorkorderButtonSpinner) {
      this.reviewWorkorderButtonSpinner.nativeElement.style.display = 'none';
    }
    if (this.reviewWorkordersButtonSpinner) {
      this.reviewWorkordersButtonSpinner.nativeElement.style.display = 'none';
    }
    if (this.raiseConcernButtonSpinner)
      this.raiseConcernButtonSpinner.nativeElement.style.display = 'none'; { }
  }

  private closeWorkorderByType(workorder: IntWorkorder): Promise<boolean> {
    const type = workorder.workorder.type;
    const workorderType = type
      .trim()
      .toLocaleLowerCase()
      .replace(/\s/g, '-');
    return this.router.navigate([`close-workorder/${workorderType}/${this.userUid}/${this.workorderUid}`]);
  }

  // filter workorder fns
  private filterTodaysWorkorders(date: string): boolean {
    const dateRaised = dayjs(date);
    return dateRaised && dateRaised.isToday() ? true : false;
  }

  private filterYesterdaysWorkorders(date: string): boolean {
    const dateRaised = dayjs(date);

    return dateRaised && dateRaised.isYesterday() ? true : false;
  }

  private filterThisWeeksWorkorders(date: string): boolean {
    const now = dayjs();
    const dateRaised = dayjs(date);
    const yearsDifference = dateRaised.year() - now.year();
    const monthsDifference = dateRaised.month() - now.month();
    const weeksDifference = dateRaised.week() - now.week();

    return yearsDifference === 0 && monthsDifference === 0 && weeksDifference === 0 ? true : false;

  }

  private filterLastWeeksWorkorders(date: string): boolean {
    const now = dayjs();
    const dateRaised = dayjs(date);

    const yearsDifference = dateRaised.year() - now.year();
    const monthsDifference = dateRaised.month() - now.month();
    const weeksDifference = dateRaised.week() - now.week();

    return yearsDifference === 0 && monthsDifference === 0 && weeksDifference === -1 ? true : false;
  }

  private filterThisMonthsWorkorders(date: string): boolean {
    const now = dayjs();
    const dateRaised = dayjs(date);

    const yearsDifference = dateRaised.year() - now.year();
    const monthsDifference = dateRaised.month() - now.month();

    return yearsDifference === 0 && monthsDifference === 0 ? true : false;
  }

  private filterLastMonthsWorkorders(date: string): boolean {
    const now = dayjs();
    const dateRaised = dayjs(date);

    const yearsDifference = dateRaised.year() - now.year();
    const monthsDifference = dateRaised.month() - now.month();

    return yearsDifference === 0 && monthsDifference === -1 ? true : false;
  }

  private updateWorkorderViewStatus(workorder: IntWorkorder) {
    const workorderUid = workorder.workorder.uid;
    const now = dayjs().format();
    // allowed seconds
    const allowedTime = 180;
    const workorderUpdateData = {
      viewedByTechnician: {
        status: true,
        dateTime: now
      }
    };

    this.workordersService.updateWorkorder(workorderUid, workorderUpdateData)
      .then(() => {
        this.refreshWorkorders(workorderUid, workorderUpdateData);
        this.toast.info('Acknowledge or handover the workorder within 3 minutes, failure to which the workorder will be escalated to the supervisor. Please note that once you acknowledge you cannot handover.', { duration: 15000, id: 'workorder-opened' });
        setTimeout(() => {
          if (this.workorder) {
            if (!this.workorder.acknowledged.status) {
              this.toast.error('You have exceeded the allowed time to acknowledge or handover the workorder. The workorder has been escalated to the supervisor.', { autoClose: false, id: 'viewed-but-not-updated' });
            }
          }

        }, 1000 * allowedTime);
      })
      .catch();
  }

  // form getters
  get f(): { [key: string]: AbstractControl } {
    return this.form?.controls;
  }

  get sparesUsedArray(): any {
    return this.form?.get('sparesUsedArray') as FormArray;
  }

  get getTotalSparesCost(): string {
    return this.form?.get('totalSparesCost')?.value;
  }

  // public functions
  createWorkordersHeader(): string {
    return this.workordersType?.replace(/-/g, '') + ' workorders';
  }

  closeLeftSidenav(): boolean {
    return this.showLeftSidenav = false;

  }

  closeRightSidenav(): boolean {
    return this.showRightSidenav = false;

  }

  displayWorkorder(workorderNumber: string): IntWorkorder | undefined {
    const workorder = this.workordersToDisplay?.find((workorder: IntWorkorder) => workorder?.workorder.number === workorderNumber);

    if (workorder) {
      this.workorder = workorder;
      this.workorderUid = this.workorder.workorder.uid;

      // technician has opened the workorder
      const viewedByTechnician = this.workorder.viewedByTechnician.status;
      if (this.userType === 'engineering' && !viewedByTechnician) {
        this.updateWorkorderViewStatus(this.workorder);
      }
      if (this.workorderHasActions) {
        this.showLeftSidenav = false;
        this.showRightSidenav = true;
      }
      return this.workorder;
    }
    return;

  }

  filterWorkordersByDateRaised(filterOption: string): IntWorkorder[] {
    if (filterOption) {
      this.filterOption = filterOption;
      this.workordersToDisplay = this.workorders
        .filter((workorder: IntWorkorder) => {
          const date = workorder.raised.dateTime;
          if (filterOption === 'Today') {
            return this.filterTodaysWorkorders(date) ? workorder : null;
          } else if (filterOption === 'Yesterday') {
            return this.filterYesterdaysWorkorders(date);
          }
          else if (filterOption === 'This Week') {
            return this.filterThisWeeksWorkorders(date);
          }
          else if (filterOption === 'Last Week') {
            return this.filterLastWeeksWorkorders(date);
          }
          else if (filterOption === 'This Month') {
            return this.filterThisMonthsWorkorders(date);
          }
          else if (filterOption === 'Last Month') {
            return this.filterLastMonthsWorkorders(date);
          }
          else if (filterOption === 'None') {
            return true;
          }
          else {
            this.workordersToDisplay = this.workorders;
            return this.workordersToDisplay;
          }
        });
      this.workorder = undefined;
      this.showWorkordersFilterOptions = false;
      return this.workordersToDisplay;
    } else {
      this.workorder = undefined;
      this.showWorkordersFilterOptions = false;
      return this.workordersToDisplay;
    }


  }

  filterWorkordersByType(type: string): IntWorkorder[] | null {
    return type && this.workordersToDisplay ?
      this.workordersToDisplay.filter((workorder: IntWorkorder) => workorder.workorder.type === type) ?
        this.workordersToDisplay.filter((workorder: IntWorkorder) => workorder.workorder.type === type)
        : null
      : null;
  }

  // clear errors when modal is closed
  resetForms(): void {
    const forms: FormGroup[] = [
      this.rejectWorkorderForm,
      this.changeTechniciansForm,
      this.supervisorsHandoverForm,
      this.assignTechniciansForm,
      this.engTechniciansHandoverForm,
      this.storesTechniciansHandoverForm,
      this.reviewWorkordersForm,
      this.raiseConcernForm
    ];

    forms.forEach((form: FormGroup) => {
      if (form) {
        form.reset();
        Object.keys(form?.controls).forEach(
          (key: string) => {
            if (key) {
              form.get(key)?.setErrors(null);
            }
          }
        );
      }
    });


  }

  // refresh opened modal
  refreshModals(): void {
    if (this.workorder !== undefined) {
      // this.resetForms();
      this.workorder = this.workorder;

      if (
        !this.electricalTechnicians ||
        !this.mechanicalTechnicians ||
        !this.storeTechnicians ||
        !this.productionSupervisors ||
        !this.engineeringSupervisors
      ) {
        this.getUsers();
      }
    }
  }

  // errors on workorder actions
  markDoneBeforeAcknowledged(): void {
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
  // supervisors
  approve(): void {
    if (this.workorder) {
      this.approveWorkorderLoading = true;

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
          this.refreshWorkorders(workorderUid, workorderUpdateData);

          this.toast.success(`Success. Workorder ${workorderNumber} approved successfully.`, { id: 'approve-workorder-success' });

        })
        .catch((err: any) => {
          this.closeButtonSpinners();

          this.toast.error(`Failed:
             Approving workorder ${workorderNumber} failed with error WL-04. Please try again, or report the error code to support if the issue persists.`,
            { duration: 8000, id: 'error-code-WL-04' });
        });
    }
  }

  // technicians
  acknowledge(): void {
    if (this.workorder) {
      this.acknowledgeWorkorderLoading = true;
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
          this.refreshWorkorders(workorderUid,
            workorderUpdateData);
          this.toast.success(`Success. Workorder ${workorderNumber} acknowledged successfully.`, { id: 'acknowledge-workorder-success' });
        })
        .catch(() => {
          this.closeButtonSpinners();
          this.toast.error(`Failed. Acknowleding workorder ${workorderNumber} failed with error code LW-AW-01. Please try again or report this error code to support for assistance if the issue persists.`, {
            autoClose: false, id: 'error-code-WL-09'
          });
        });

    }
  }

  markDone(): void {
    if (this.workorder) {
      this.markWorkorderDoneLoading = true;
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
          // this.refreshWorkorders();
          this.refreshWorkorders(workorderUid,
            workorderUpdateData);

          this.toast.success(`Success. Workorder ${workorderNumber} marked as done. Click on the workorder to view the time taken.`, { id: 'mark-workorder-done-success' });
        })
        .catch(() => {
          this.closeButtonSpinners();
          this.toast.error(`Failed. Marking workorder ${workorderNumber} as done failed with error code LW-MWD-01. Please try again or report this error code to support for assistance if the issue persists.`, {
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
          this.refreshWorkorders(workorderUid,
            workorderUpdateData);
          this.toast.success(`Success. Workorder ${workorderNumber} reviewed successfully.`, { id: 'review-workorder-success' });
        })
        .catch(() => {
          this.closeButtonSpinners();
          this.toast.error(`Failed. Reviewing workorder ${workorderNumber} failed with error code LW-RSW-01. Please try again or report the error code to support to have the issue fixed.`, { autoClose: false, id: 'review-workorder-error' });
        });
    }
  }

  closeHelpModal(event: any): boolean {
    console.log('ACTIATED event');
    console.log(event);
    return this.showHelpModal = false;
  }
}
