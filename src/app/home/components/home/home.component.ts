// angular core imports
import { Component, OnInit } from '@angular/core';

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

  constructor(
    // for resending verification email
    private authenticationService: AuthenticationService,
    private workordersService: WorkordersService,
    private spinner: NgxSpinnerService,
    private auth: Auth,
    private toast: HotToastService,
    private router: Router,
  ) { }

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
  defaultError = `Error UHE-01 occured. Please try reloading this page or report this error to support to have the issue fixed if it persists.`;

  // toggle view chart/data
  viewData = false;

  ngOnInit(): void {
    onAuthStateChanged(this.auth,
      (user: User | null) => {
        this.user = user;
        if (user !== null) {
          this.userUid = user.uid;
          if (!user.emailVerified) {
            this.loading = false;
            this.viewData = true;

          } else {
            this.getAllWorkorders();
            this.getUserAndWorkorders(this.userUid);
          }
        } else {
          this.loading = false;
          this.viewData = true;
          
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
  private getUserAndWorkorders(userUid: string): void {
    this.workordersService.getUser(userUid)
      .then((firestoreUser: IntUser) => {
        if (firestoreUser.group === 'Supervisor') {
          this.filterRaisedWorkorders();
          this.filterUnverifiedWorkorders();
          this.filterApprovedWorkorders();
          this.filterRejectedWorkorders();
          this.filterEscalatedWorkorders();
          this.isSupervisor = true;
          this.hideSpinnerOnSuccess();
        }

        else if (firestoreUser.group === 'Technician') {
          // eng technician
          if (firestoreUser.technicianGroup === 'Electrical'
            ||
            firestoreUser.technicianGroup === 'Mechanical') {
            this.filterEngTechnicianOpenWorkorders();
            this.filterEngTechnicianClosedWorkorders();
            this.isEngineeringTechnician = true;
            this.technicianType = 'engineering';
            this.hideSpinnerOnSuccess();
          }

          // stores technician
          else if (
            firestoreUser.technicianGroup === 'Eng. Store'
            ||
            firestoreUser.technicianGroup === 'PM Planning'
          ) {
            this.filterStoreTechnicianOpenWorkorders();
            this.filterStoreTechnicianClosedWorkorders();
            this.isStoresTechnician = true;
            this.technicianType = 'stores';
            this.hideSpinnerOnSuccess();
          }
        }

        else if (firestoreUser.group === 'Manager' && firestoreUser.managerGroup === 'Engineering') {
          this.filterUnReviewedWorkorders();
          this.filterReviewedWorkorders();
          this.isEngineeringManager = true;
          this.hideSpinnerOnSuccess();
        }

        else {
          this.filterRaisedWorkorders();
          this.filterOtherApprovedWorkorders();
          this.filterOtherRejectedWorkorders();
          this.isOperatorOrOperatorLike = true;
          this.hideSpinnerOnSuccess();
        }
      })
      .catch(
        (err: any) => {
          this.hideSpinnerOnError();
          if (err.code === 'failed-precondition') {
            this.indexingError = `Error IND-H-02 occured. Please report this error to support to have it fixed.`;
          } else {
            this.otherError = `Error H-02 occured. Please report this error to support to have it fixed.`;
          }
        }
      );
  }

  // get all wokrorders first
  private getAllWorkorders(): void {
    console.log('HOME METHOD CALLED');
    this.workordersService.$allWorkorders.subscribe(
      (workorders: IntWorkorder[] | null) => {
        if (workorders) {
          this.workorders = workorders;
          console.log('INSIDE HOME METHOD SUBSCRIBE', this.workorders);
        } else {
          this.workordersService.getAllWorkorders()
            .catch((err: any) => {
              this.hideSpinnerOnError();
              if (err.code === 'failed-precondition') {
                this.indexingError = `Error IND-H-01 occured. Please report this error to support to have it fixed.`;
              } else {
                this.otherError = `Error H-01 occured. Please try reloading this page or report this error to support to have the issue fixed if it persists.`;
              }
            });
        }
      }
    );
  }

  // SUPERVISORS WORKORDERS
  private filterRaisedWorkorders(): IntWorkorder[] | null {
    if (this.workorders) {
      this.raisedWorkorders = this.workorders.filter(
        (workorder: IntWorkorder) => {
          if (workorder.raiser.uid === this.userUid) {
            return true;
          }
          return false;
        }
      );
      return this.raisedWorkorders;
    }
    return null;
  }

  private filterUnverifiedWorkorders(): IntWorkorder[] | null {
    if (this.workorders) {
      this.unverifiedWorkorders = this.workorders.filter(
        (workorder: IntWorkorder) => {
          const approved = workorder.approved.status;
          const rejected = workorder.rejected.status;
          const supervisor = workorder.supervisor.uid;

          if (!approved && !rejected && supervisor === this.userUid) { return true; }

          return false;
        }
      );
      return this.unverifiedWorkorders;
    }

    return null;
  }

  private filterApprovedWorkorders(): IntWorkorder[] | null {
    if (this.workorders) {
      this.approvedWorkorders = this.workorders.filter(
        (workorder: IntWorkorder) => {
          const approved = workorder.approved.status;
          const rejected = workorder.rejected.status;
          const supervisor = workorder.supervisor.uid;

          if (
            approved === true &&
            rejected === false &&
            supervisor === this.userUid) {
            return true;
          } return false;
        }
      );
      return this.approvedWorkorders;
    }
    return null;
  }

  private filterRejectedWorkorders(): IntWorkorder[] | null {
    if (this.workorders) {
      this.rejectedWorkorders = this.workorders.filter(
        (workorder: IntWorkorder) => {
          const approved = workorder.approved.status;
          const rejected = workorder.rejected.status;
          const supervisor = workorder.supervisor.uid;

          if (
            approved === false &&
            rejected === true &&
            supervisor === this.userUid) {
            return true;
          } return false;
        }
      );
      return this.rejectedWorkorders;
    }

    return null;
  }

  private filterEscalatedWorkorders(): IntWorkorder[] | null {
    if (this.workorders) {
      this.escalatedWorkorders = this.workorders.filter(
        (workorder: IntWorkorder) => workorder.escalated?.status
      );

      return this.escalatedWorkorders;
    }

    return null;
  }

  // OPERATORS WORKORDERS
  private filterOtherApprovedWorkorders(): IntWorkorder[] | null {
    if (this.workorders) {
      this.approvedWorkorders = this.workorders.filter(
        (workorder: IntWorkorder) => {
          const approved = workorder.approved.status;
          const rejected = workorder.rejected.status;
          const raiser = workorder.raiser.uid;

          if (
            approved === true &&
            rejected === false &&
            raiser === this.userUid
          ) {
            return true;
          }
          return false;
        }
      );
      return this.approvedWorkorders;
    }
    return null;
  }

  private filterOtherRejectedWorkorders(): IntWorkorder[] | null {
    if (this.workorders) {
      this.rejectedWorkorders = this.workorders.filter(
        (workorder: IntWorkorder) => {
          const approved = workorder.approved.status;
          const rejected = workorder.rejected.status;
          const raiser = workorder.raiser.uid;

          if (
            approved === false &&
            rejected === true &&
            raiser === this.userUid
          ) {
            return true;
          }
          return false;
        }
      );
      return this.rejectedWorkorders;
    }
    return null;
  }

  // ENG TECHNICIANS WORKORDERS
  private filterEngTechnicianOpenWorkorders(): IntWorkorder[] | null {
    if (this.workorders) {
      this.engTechnicianOpenWorkorders = this.workorders.filter(
        (workorder: IntWorkorder) => {
          const approved = workorder.approved.status;
          const rejected = workorder.rejected.status;
          const closed = workorder.closed.status;
          const technician = workorder.technician.uid;

          if (
            approved === true &&
            rejected === false &&
            closed === false &&
            technician === this.userUid

          ) { return true; }

          return false;

        }
      );
      return this.engTechnicianOpenWorkorders;
    }

    return null;
  }

  private filterEngTechnicianClosedWorkorders(): IntWorkorder[] | null {
    if (this.workorders) {
      this.engTechnicianClosedWorkorders = this.workorders.filter(
        (workorder: IntWorkorder) => {
          const approved = workorder.approved.status;
          const rejected = workorder.rejected.status;
          const closed = workorder.closed.status;
          const technician = workorder.technician.uid;

          if (
            approved === true &&
            rejected === false &&
            closed === true &&
            technician === this.userUid

          ) { return true; }

          return false;

        }
      );
      return this.engTechnicianClosedWorkorders;
    }

    return null;
  }

  // STORES TECHNICIANS WORKORDERS
  private filterStoreTechnicianOpenWorkorders(): IntWorkorder[] | null {
    if (this.workorders) {
      this.storesTechnicianOpenWorkorders = this.workorders.filter(
        (workorder: IntWorkorder) => {
          const approved = workorder.approved.status;
          const rejected = workorder.rejected.status;
          const closed = workorder.closed.status;
          const stores = workorder.storesTechnician.uid;

          if (
            approved === true &&
            rejected === false &&
            closed === false &&
            stores === this.userUid
          ) { return true; }

          return false;
        });
      return this.storesTechnicianOpenWorkorders;
    }
    return null;
  }

  private filterStoreTechnicianClosedWorkorders(): IntWorkorder[] | null {
    if (this.workorders) {
      this.storesTechnicianClosedWorkorders = this.workorders.filter(
        (workorder: IntWorkorder) => {
          const approved = workorder.approved.status;
          const rejected = workorder.rejected.status;
          const closed = workorder.closed.status;
          const stores = workorder.storesTechnician.uid;

          if (
            approved === true &&
            rejected === false &&
            closed === true &&
            stores === this.userUid
          ) { return true; }

          return false;
        });

      return this.storesTechnicianClosedWorkorders;
    }
    return null;
  }

  // MANAGERS WORKORDERS
  private filterReviewedWorkorders(): IntWorkorder[] | null {
    if (this.workorders) {
      this.reviewedWorkorders = this.workorders.filter(
        (workorder: IntWorkorder) => {
          const reviewed = workorder.review?.status;
          // status => reviewed

          if (reviewed) { return true; }

          return false;
        }
      );

      return this.reviewedWorkorders;
    }
    return null;
  }

  private filterUnReviewedWorkorders(): IntWorkorder[] | null {
    if (this.workorders) {
      this.unReviewedWorkorders = this.workorders.filter(
        (workorder: IntWorkorder) => {
          const reviewed = workorder.review?.status;
          // sttaus => accepted, denied, cancelled
          if (!reviewed || reviewed === '') { return true; }

          return false;
        }
      );

      return this.unReviewedWorkorders;
    }
    return null;
  }

  resendVerificationCode(): any {
    if (this.user) {
      const uid = this.user.uid;

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
