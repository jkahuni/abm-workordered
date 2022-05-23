import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';

// rxjs
import { takeUntil, Subject } from 'rxjs';

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
    private workordersService: WorkordersService,
    private toast: HotToastService,
  ) { }
  private stopWorkordersListener: Subject<boolean> = new Subject<boolean>();

  // template refs
  @ViewChild('loadingWorkordersSpinner') loadingWorkordersSpinner!: ElementRef;

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

  // for handover templates
  supervisors!: IntUser[];
  technicians!: IntUser[];

  // when to show right-sidenav
  workorderHasActions = false;

  // toggle sidenavs
  showLeftSidenav = true;
  showRightSidenav = false;

  // loading spinner
  loadingWorkorders = true;
  loadingWorkordersFailed = false;
  loadingWorkordersIndexingError!: string;
  loadingWorkordersOtherError!: string;
  loadingWorkordersDefaultError: string = `
  Loading workorders failed with error code ULW-01. Try reloading the page or report the error code to support to have it fixed.`;

  // filter workorders
  showWorkordersFilterOptions = false;
  filterOption!: string;

  // show/hide
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
        this.supervisors = users.filter((user: IntUser) => user.group === 'Supervisor'
        );

        this.technicians = users.filter(
          (user: IntUser) =>
            user.group === 'Technician'
        );
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
    this.workorder = this.workordersToDisplay?.find((workorder: IntWorkorder) => workorder?.workorder.number === workorderNumber);

    if (this.workorder) {
      this.workorderUid = this.workorder.workorder.uid;
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

  closeAllModals(): void {
    this.showHelpModal = false;
    this.showRejectWorkorderModal = false;
    this.showSupervisorsHandoverModal = false;
    this.showChangeTechniciansModal = false;
    this.showAssignTechniciansModal = false;
    this.showEngTechnicianHandoverModal = false;
    this.showStoreTechnicianHandoverModal = false;
    this.showReviewWorkordersModal = false;
    this.showRaiseConcernsModal = false;
  }

  // from actions component
  toggleModal(event: string): boolean | void {
    console.log('IN LIST, ', event);
    return event ?
      event === 'help' ?
        this.showHelpModal = true :
        event === 'reject' ?
          this.showRejectWorkorderModal = true
          : event === 'supervisorHandover' ?
            this.showSupervisorsHandoverModal = true
            : event === 'changeTechnicians' ?
              this.showChangeTechniciansModal = true
              : event === 'assignTechnicians' ?
                this.showAssignTechniciansModal = true
                : event === 'techniciansHandover' ?
                  this.showEngTechnicianHandoverModal = true
                  : event === 'storesHandover' ?
                    this.showStoreTechnicianHandoverModal = true
                    : event === 'reviewWorkorders' ?
                      this.showReviewWorkordersModal = true
                      : event === 'raiseConcern' ?
                        this.showRaiseConcernsModal = true
                        : event === 'close' ?
                          this.closeAllModals()
                          : false
      : false;
  }

  // updating the workorder
  updateWorkorder(uid: string): any {
    const workorder = this.workorders.find((workorder: IntWorkorder) => workorder.workorder.uid === uid);

    if (workorder) {
      this.workorder = workorder;
    } else {
      this.workorder = undefined;
      this.showLeftSidenav = true;
      this.showRightSidenav = false;
    }
  }
}
