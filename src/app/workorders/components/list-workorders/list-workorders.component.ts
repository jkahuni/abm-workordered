import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';

// rxjs
import { takeUntil, Subject } from 'rxjs';

// services
import { WorkordersService } from '@workorders/services/workorders.service';
import { HotToastService } from '@ngneat/hot-toast';

// interfaces
import { IntUser, IntWorkorder } from '@workorders/models/workorders.models';

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
    public mediaMatcher: MediaMatcher,
  ) {
    this.updateScreenProperties
      .pipe(takeUntil(this.onDestroy))
      .subscribe(
        (object: SidenavsDeterminer) => {
          const largeScreen = object['largeScreen'];
          const hasActions = object['workorderHasActions'];

          this.largeScreen = largeScreen;

          if (hasActions) {
            this.showLeftSidenav = true;
            this.showRightSidenav = true;
          } else {
            this.showLeftSidenav = true;
            this.showRightSidenav = false;
          }

        }


      );

    this.setActionsAndUsers
      .pipe(takeUntil(this.onDestroy))
      .subscribe((workorderHasActions: boolean) => {
        this.workorderHasActions = workorderHasActions;
        if (workorderHasActions) {
          this.getUsers();
        } 
      });
  }


  private onDestroy: Subject<void> = new Subject<void>();
  private updateScreenProperties: Subject<SidenavsDeterminer> = new Subject<SidenavsDeterminer>();
  private setActionsAndUsers: Subject<boolean> = new Subject<boolean>();

  matcher!: MediaQueryList;

  // template refs
  @ViewChild('loadingWorkordersSpinner') loadingWorkordersSpinner!: ElementRef;

  // route params
  userType!: string | null;
  workordersType!: string | null;
  userUid!: string | null;

  workorders!: IntWorkorder[];
  workordersToDisplay!: IntWorkorder[];
  workorder!: IntWorkorder | undefined;

  // for handover templates
  supervisors!: IntUser[];
  technicians!: IntUser[];

  // when to show right-sidenav
  workorderHasActions!: boolean;

  // toggle sidenavs
  showLeftSidenav!: boolean;
  showRightSidenav!: boolean;

  // loading spinner
  loadingWorkorders = true;
  loadingWorkordersFailed = false;
  loadingWorkordersIndexingError!: string;
  loadingWorkordersOtherError!: string;
  loadingWorkordersDefaultError: string = `
  Loading workorders failed with error code ULW-01. Try reloading the page or report the error code to support to have it fixed.`;

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

  largeScreen!: boolean;

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
    this.matcher.removeEventListener('change', this.mediaSizeListener);

  }

  ngOnInit(): void {
    this.userType = this.route.snapshot.paramMap.get('userType');
    this.workordersType = this.route.snapshot.paramMap.get('workordersType');
    this.userUid = this.route.snapshot.paramMap.get('userUid');

    this.getWorkorders();

    this.matcher = this.mediaMatcher.matchMedia('(min-width: 670px)');
    this.matcher.addEventListener('change', this.mediaSizeListener);
    this.getScreenSizeOnLoad((window.innerWidth) > 670);
  }

  private getScreenSizeOnLoad(largeScreen: boolean): void {
    this.updateScreenProperties.next(this.checkWorkorderStatus(largeScreen));
  }

  private mediaSizeListener = (event: { matches: any }) => {
    this.updateScreenProperties.next(this.checkWorkorderStatus(event.matches))
  }

  // create query
  private filterUsersWorkorders(workorders: IntWorkorder[]): IntWorkorder[] | undefined {
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
          this.setActionsAndUsers.next(false);
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
          this.setActionsAndUsers.next(true);
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

          this.setActionsAndUsers.next(true);
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
          this.setActionsAndUsers.next(false);

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
          this.setActionsAndUsers.next(false);

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
          this.setActionsAndUsers.next(false);

          return raisedWorkorders;

        }

        // escalated
        else if (this.workordersType === 'escalated') {
          const escalatedWorkorders = workorders.filter(
            (workorder: IntWorkorder) => {
              const escalated = workorder.escalated?.status;

              if (escalated) {
                return true;
              }
              return false;
            }
          );

          this.setActionsAndUsers.next(true);
          return escalatedWorkorders;
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

          this.setActionsAndUsers.next(true);
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
          this.setActionsAndUsers.next(false);

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

          this.setActionsAndUsers.next(true);
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

          this.setActionsAndUsers.next(true);
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
          this.setActionsAndUsers.next(false);

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
          this.setActionsAndUsers.next(false);

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
          this.setActionsAndUsers.next(false);

          return rejectedWorkorders;
        }
      }
    }
    return;
  }

  // get workorders
  private getWorkorders(): void {
    this.workordersService.$allWorkorders
      .pipe(takeUntil(this.onDestroy))
      .subscribe(
        (workorders: IntWorkorder[] | null) => {
          if (workorders !== null) {
            const filteredWorkorders = this.filterUsersWorkorders(workorders);

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

  // public functions
  createWorkordersHeader(): string {
    return this.workordersType?.replace(/-/g, '') + ' workorders';
  }

  closeLeftSidenav(): boolean {
    return this.showLeftSidenav = this.largeScreen && this.workorderHasActions ? true : false;
  }

  closeRightSidenav(): boolean {
    return this.showRightSidenav = this.largeScreen && this.workorderHasActions ? true : false;
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

  // from workorder numbers components
  workordersFiltered(workorders: IntWorkorder[]): any {
    this.workordersToDisplay = workorders;
    if (workorders.length === 0) {
      this.workorder = undefined;
    }

  }

  displayCurrentWorkorder(workorder: IntWorkorder): any {
    this.workorder = workorder;

    this.updateScreenProperties.next(this.checkWorkorderStatus(this.largeScreen));
  }

  private checkWorkorderStatus(largeScreen: boolean): SidenavsDeterminer {
    const workorderHasActions = this.workorderHasActions ? this.workorderHasActions : false;

    return {
      largeScreen,
      workorderHasActions
    };

  }

  // from actions component
  toggleModal(event: string): boolean | void {
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

  // $event = uid
  updateWorkorder(uid: string): any {
    const workorder = this.workorders.find((workorder: IntWorkorder) => workorder.workorder.uid === uid);

    if (workorder) {
      this.workorder = workorder;
    } else {
      this.workorder = undefined;
      if (this.largeScreen) {
        this.showLeftSidenav = true;
        this.showRightSidenav = true;
      } else {
        this.showLeftSidenav = true;
        this.showRightSidenav = false;
      }
    }
  }
}

export interface SidenavsDeterminer {
  largeScreen: boolean;
  workorderHasActions: boolean;
}
