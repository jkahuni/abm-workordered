// angular core imports
import { Component, OnInit } from '@angular/core';
import { MessagingService } from '@messaging/services/messaging.service';

// router
import { Router } from '@angular/router';

// services
import { AuthenticationService } from '@authentication/services/authentication.service';
import { WorkordersService } from '@workorders/services/workorders.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HotToastService } from '@ngneat/hot-toast';

// interfaces
import { IntUser, IntWorkorder } from '@workorders/models/workorders.models';

//  firebase and firestore
import { User, Auth, onAuthStateChanged } from '@angular/fire/auth';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  // used in the template and in resending verification code
  user!: User | null;

  // for workorder queries
  // also used as route parameter
  userUid!: string;
  technicianType!: string;

  // different workorders
  raisedWorkorders!: IntWorkorder[];
  unverifiedWorkorders!: IntWorkorder[];
  approvedWorkorders!: IntWorkorder[];
  rejectedWorkorders!: IntWorkorder[];
  escalatedWorkorders!: IntWorkorder[];
  engTechnicianOpenWorkorders!: IntWorkorder[];
  engTechnicianClosedWorkorders!: IntWorkorder[];
  storesTechnicianOpenWorkorders!: IntWorkorder[];
  storesTechnicianClosedWorkorders!: IntWorkorder[];
  unReviewedWorkorders!: IntWorkorder[];
  reviewedWorkorders!: IntWorkorder[];
  workorders!: IntWorkorder[];


  // for controlling access to the various views in home page
  isOperatorOrOperatorLike = false;
  isSupervisor = false;
  isEngineeringTechnician = false;
  isStoresTechnician = false;
  isEngineeringManager = false;

  // for errors
  loading = true;
  loadingFailed = false;
  indexingError!: string;
  otherError!: string;
  defaultError = `Error of code UHE-01 occured. Please try reloading this page or report this error code to support to have the issue fixed if it persists.`;

  constructor(
    // for resending verification email
    private authenticationService: AuthenticationService,
    private workordersService: WorkordersService,
    private spinner: NgxSpinnerService,
    private auth: Auth,
    private toast: HotToastService,
    private router: Router,
    private messagingService: MessagingService
  ) { }

  ngOnInit(): void {
    this.homeSetup();
  }

  private homeSetup(): void {
    onAuthStateChanged(this.auth,
      (user: User | null) => {
        this.user = user;
        if (user !== null) {
          this.userUid = user.uid;
          if (!user.emailVerified) {
            this.loading = false;

          } else {
            this.getWorkorders();
            this.usersWorkordersSetup(this.userUid);
          }
        } else {
          this.loading = false;

        }
      },
      (err: any) => {
        this.hideSpinnerOnError();
        this.toast.error(`An unknownn error occured while redirecting you home. Please reload the page.`);
      }
    );
  }

  // hiding the spinner
  private hideSpinnerOnSuccess(): void {
    if (this.isOperatorOrOperatorLike && this.raisedWorkorders) {
      this.loading = false;
    }

    else if (
      this.isSupervisor &&
      this.unverifiedWorkorders &&
      this.approvedWorkorders &&
      this.rejectedWorkorders) {
      this.loading = false;
    }

    else if (
      this.isEngineeringTechnician &&
      this.engTechnicianOpenWorkorders &&
      this.engTechnicianClosedWorkorders
    ) {
      this.loading = false;
    }

    else if (
      this.isStoresTechnician &&
      this.storesTechnicianClosedWorkorders &&
      this.storesTechnicianOpenWorkorders
    ) {
      this.loading = false;
    }

    else if (
      this.isEngineeringManager &&
      this.workorders &&
      this.unReviewedWorkorders &&
      this.reviewedWorkorders
    ) {
      this.loading = false;
    }
  }

  private hideSpinnerOnError(): void {
    this.loading = false;
    this.loadingFailed = true;
  }

  // get user and their specific workorders
  private usersWorkordersSetup(userUid: string): void {
    this.workordersService.getUser(userUid)
      .then((firestoreUser: IntUser) => {
        if (firestoreUser.group === 'Supervisor') {
          this.isSupervisor = true;
        }

        else if (firestoreUser.group === 'Technician') {
          // eng technician
          if (firestoreUser.technicianGroup === 'Electrical'
            ||
            firestoreUser.technicianGroup === 'Mechanical') {
            this.isEngineeringTechnician = true;
            this.technicianType = 'engineering';
          }

          // stores technician
          else if (
            firestoreUser.technicianGroup === 'Eng. Store'
            ||
            firestoreUser.technicianGroup === 'PM Planning'
          ) {
            this.isStoresTechnician = true;
            this.technicianType = 'stores';
          }
        }

        else if (firestoreUser.group === 'Manager' && firestoreUser.managerGroup === 'Engineering') {
          this.isEngineeringManager = true;
        }

        else {
          this.isOperatorOrOperatorLike = true;

        }
      }
      )
      .then(() => this.filterWorkorders()
      )
      .catch(
        (err: any) => {
          this.hideSpinnerOnError();
          if (err.code === 'failed-precondition') {
            this.indexingError = `Error of code IND-H-02 occured. Please report this error to support to have it fixed.`;
          } else {
            this.otherError = `Error of code H-02 occured. Please reload the page or report this error to support to have it fixed if it persists`;
          }
        }
      );
  }

  // get all wokrorders first
  private getWorkorders(): void {
    this.workordersService.$allWorkorders.subscribe(
      (workorders: IntWorkorder[] | null) => {
        if (workorders) {
          this.workorders = workorders;
        } else {
          this.workordersService.getAllWorkorders()
            .catch((err: any) => {
              this.hideSpinnerOnError();
              if (err.code === 'failed-precondition') {
                this.indexingError = `Error of code IND-H-01 occured. Please report this error to support to have it fixed.`;
              } else {
                this.otherError = `Error of code H-01 occured. Please try reloading this page or report this error to support to have the issue fixed if it persists.`;
              }
            });
        }
      }
    );
  }

  private filterWorkorders(): any {
    let raisedWorkorders: IntWorkorder[] = [];
    let unverifiedWorkorders: IntWorkorder[] = [];
    let approvedWorkorders: IntWorkorder[] = [];
    let rejectedWorkorders: IntWorkorder[] = [];
    let escalatedWorkorders: IntWorkorder[] = [];
    let openWorkorders: IntWorkorder[] = [];
    let closedWorkorders: IntWorkorder[] = [];
    let reviewedWorkorders: IntWorkorder[] = [];
    let unreviewedWorkorders: IntWorkorder[] = [];

    for (let workorder of this.workorders) {
      const raiser = workorder.raiser.uid;
      const supervisor = workorder.supervisor?.uid;
      const technician = workorder.technician?.uid;
      const storesTechnician = workorder.storesTechnician?.uid;
      const approved = workorder.approved.status;
      const rejected = workorder.rejected.status;
      const escalated = workorder.escalated?.status;
      const closed = workorder.closed.status;
      const reviewed = workorder.review?.status;

      // raised, approved, rejected
      if (this.isOperatorOrOperatorLike) {
        if (raiser === this.userUid) {
          raisedWorkorders.push(workorder);

          if (approved && !rejected) {
            approvedWorkorders.push(workorder);
          }

          if (rejected && !approved) {
            rejectedWorkorders.push(workorder);
          }
        }
      }

      // raised, unverified, approved, rejected, escalated
      else if (this.isSupervisor) {
        if (raiser === this.userUid) {
          raisedWorkorders.push(workorder);
        }

        if (!approved && !rejected) {
          unverifiedWorkorders.push(workorder);
        }

        if (supervisor === this.userUid) {
          if (approved && !rejected) {
            approvedWorkorders.push(workorder);
          }

          if (!approved && rejected) {
            rejectedWorkorders.push(workorder);
          }

          if ((escalated !== undefined || escalated !== null) && escalated) {
            escalatedWorkorders.push(workorder);
          }


        }
      }

      // open, closed
      else if (this.isEngineeringTechnician || this.isStoresTechnician) {
        if ((technician === this.userUid) || (storesTechnician === this.userUid)) {
          if (approved && !rejected) {
            if (!closed) {
              openWorkorders.push(workorder);
            }

            else {
              closedWorkorders.push(workorder);
            }

          }
        }
      }

      // reviewed, unreviewed, escalated
      else if (this.isEngineeringManager) {
        if ((escalated !== undefined || escalated !== null) && escalated) {
          escalatedWorkorders.push(workorder);
        }

        if (reviewed) {
          reviewedWorkorders.push(workorder);
        }

        else if (!reviewed || reviewed === '') {
          unreviewedWorkorders.push(workorder);
        }

      }
    }

    this.raisedWorkorders = raisedWorkorders;
    this.unverifiedWorkorders = unverifiedWorkorders;
    this.approvedWorkorders = approvedWorkorders;
    this.rejectedWorkorders = rejectedWorkorders;
    this.escalatedWorkorders = escalatedWorkorders;
    this.engTechnicianOpenWorkorders = openWorkorders;
    this.engTechnicianClosedWorkorders = closedWorkorders;
    this.storesTechnicianOpenWorkorders = openWorkorders;
    this.storesTechnicianClosedWorkorders = closedWorkorders;
    this.unReviewedWorkorders = unreviewedWorkorders;
    this.reviewedWorkorders = reviewedWorkorders;

    this.hideSpinnerOnSuccess();

  }

  resendVerificationCode(): any {
    if (this.user) {
      this.spinner.show('app-verify-email-spinner');
      this.authenticationService
        .sendVerificationEmail(this.user)
        .then(() => {

          this.router.navigate([`authentication/verify-email`]);
          this.spinner.hide('app-verify-email-spinner');

        })
        .catch((error: any) => {
          this.spinner.hide('app-verify-email-spinner');
          const errorCode = error.code;
          if (errorCode === 'auth/too-many-requests') {
            this.toast.info(
              `Verification code already sent to ${this.user?.email}.
               If this is not your email address please contact the admin for assistance.`,
              { duration: 6000, id: 'resend-email-verification-code-info-1' });
          } else {
            this.toast.error('An error occured. Please try again or contact the admin for assistance.',
              { duration: 5000, id: 'resend-email-verification-code-error-2' });
          }
        });
    } else {
      this.router.navigate(['/']);
    }
  }
}
