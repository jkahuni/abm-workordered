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
import {
  Firestore, collection, where, query, orderBy
} from '@angular/fire/firestore';

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
    private firestore: Firestore
  ) { }

  // used in the template and in resending verification code
  user!: User | null;

  // for workorder queries
  // also used as route parameter
  userUid!: string;
  technicianType!: string;

  // w/o col ref
  workordersCollectionReference = collection(this.firestore, 'workorders');

  // for the different workorder views
  raisedWorkorders!: IntWorkorder[];
  unverifiedWorkorders!: IntWorkorder[];
  approvedWorkorders!: IntWorkorder[];
  rejectedWorkorders!: IntWorkorder[];
  engTechnicianOpenWorkorders!: IntWorkorder[];
  engTechnicianClosedWorkorders!: IntWorkorder[];
  storesTechnicianOpenWorkorders!: IntWorkorder[];
  storesTechnicianClosedWorkorders!: IntWorkorder[];


  // for controlling access to the various views in home page
  isOperatorOrOperatorLike = false;
  isSupervisor = false;
  isEngineeringTechnician = false;
  isStoresTechnician = false;

  // for errors
  loading = true;
  loadingFailed = false;
  indexingError!: string;
  otherError!: string;
  defaultError = `Error UHE-01 occured. Please report this error to support to have if fixed.`;

  // for controlling the spinner
  raisedWorkordersSet = false;
  unverifiedWorkordersSet = false;
  approvedWorkordersSet = false;
  rejectedWorkordersSet = false;
  engTechnicianOpenWorkordersSet = false;
  engTechnicianClosedWorkordersSet = false;
  storesTechnicianOpenWorkordersSet = false;
  storesTechnicianClosedWorkordersSet = false;

  ngOnInit(): void {
    onAuthStateChanged(this.auth,
      (user: User | null) => {
        this.user = user;
        if (user !== null) {
          this.userUid = user.uid;
          if (!user.emailVerified) {
            this.hideSpinnerOnError();

          } else {
            this.getUser(this.userUid);
          }
        } else {
          this.loading = false;

        }
      },
      (err: any) => {
        this.hideSpinnerOnError();
        console.log('ERR IN HOME INIT ON AUTH STATE', err);
        this.toast.error(`An unknownn error occured while redirecting you home. Please reload the page.`);
      }
    );
  }

  // hiding the spinner
  private hideSpinnerOnSuccess(): void {
    if (this.isOperatorOrOperatorLike && this.raisedWorkordersSet) {
      this.loading = false;

    } else if (
      this.isSupervisor &&
      this.unverifiedWorkordersSet &&
      this.approvedWorkordersSet &&
      this.rejectedWorkordersSet) {
      this.loading = false;


    } else if (
      this.isEngineeringTechnician &&
      this.engTechnicianOpenWorkordersSet &&
      this.engTechnicianClosedWorkordersSet
    ) {
      this.loading = false;


    } else if (
      this.isStoresTechnician &&
      this.storesTechnicianClosedWorkordersSet &&
      this.storesTechnicianOpenWorkordersSet
    ) {
      this.loading = false;


    }
  }

  private hideSpinnerOnError(): void {
    this.loading = false;
    this.loadingFailed = true;

  }

  // get user
  private getUser(userUid: string): void {
    this.workordersService.getUser(userUid)
      .then((firestoreUser: IntUser) => {
        if (firestoreUser.group === 'Supervisor') {
          this.isSupervisor = true;
          this.getRaisedWorkorders();
          this.getUnverifiedWorkorders();
          this.getApprovedWorkorders();
          this.getRejectedWorkorders();
        }

        else if (firestoreUser.group === 'Technician') {
          // eng technician
          if (firestoreUser.technicianGroup === 'Electrical'
            ||
            firestoreUser.technicianGroup === 'Mechanical') {
            this.isEngineeringTechnician = true;
            this.getEngTechnicianOpenWorkorders();
            this.getEngTechnicianClosedWorkorders();
            this.technicianType = 'engineering';
          }

          // stores technician
          else if (
            firestoreUser.technicianGroup === 'Eng. Store'
            ||
            firestoreUser.technicianGroup === 'PM Planning'
          ) {
            this.isStoresTechnician = true;
            this.getStoresTechnicianOpenWorkorders();
            this.getStoresTechnicianClosedWorkorders();
            this.technicianType = 'stores';
          }
        }

        else {
          this.isOperatorOrOperatorLike = true;
          this.getRaisedWorkorders();
          this.getOtherApprovedWorkorders();
          this.getOtherRejectedWorkorders();
        }
      })
      .catch(
        (err: any) => {
          this.hideSpinnerOnError();
          if (err.code === 'failed-precondition') {
            this.indexingError = `Error IND-H-11 occured. Please report this error to support to have it fixed.`;
          } else {
            this.otherError = `Error H-11 occured. Please report this error to support to have it fixed.`;
          }
        }
      );
  }

  // getting workorders by type
  private getRaisedWorkorders(): void {
    const workordersQuery = query(
      this.workordersCollectionReference,
      orderBy('workorder.number'),
      where('raiser.uid', '==', this.userUid)
    );

    this.workordersService.getWorkorders(workordersQuery)
      .then((workorders: IntWorkorder[]) => {
        this.raisedWorkordersSet = true;
        this.raisedWorkorders = workorders;
        this.hideSpinnerOnSuccess();
      })
      .catch((err: any) => {
        this.hideSpinnerOnError();
        if (err.code === 'failed-precondition') {
          this.indexingError = `Error IND-H-01 occured. Please report this error to support to have it fixed.`;
        } else {
          this.otherError = `Error H-01 occured. Please report this error to support to have it fixed.`;
        }
      });
  }

  private getUnverifiedWorkorders(): void {
    const workordersQuery = query(
      this.workordersCollectionReference,
      orderBy('workorder.number'),
      where('approved.status', '==', false),
      where('rejected.status', '==', false),
      where('supervisor.uid', '==', this.userUid)
    );

    this.workordersService.getWorkorders(workordersQuery)
      .then((workorders: IntWorkorder[]) => {
        this.unverifiedWorkordersSet = true;
        this.unverifiedWorkorders = workorders;
        this.hideSpinnerOnSuccess();

      }).catch((err: any) => {
        this.hideSpinnerOnError();
        if (err.code === 'failed-precondition') {
          this.indexingError = `Error IND-H-02 occured. Please report this error to support to have it fixed.`;
        } else {
          this.otherError = `Error H-02 occured. Please report this error to support to have it fixed.`;
        }
      });
  }

  private getApprovedWorkorders(): void {
    const workordersQuery = query(
      this.workordersCollectionReference,
      orderBy('workorder.number'),
      where('approved.status', '==', true),
      where('rejected.status', '==', false),
      where('supervisor.uid', '==', this.userUid)
    );

    this.workordersService.getWorkorders(workordersQuery)
      .then((workorders: IntWorkorder[]) => {
        this.approvedWorkordersSet = true;
        this.approvedWorkorders = workorders;
        this.hideSpinnerOnSuccess();

      }).catch((err: any) => {
        this.hideSpinnerOnError();
        if (err.code === 'failed-precondition') {
          this.indexingError = `Error IND-H-03 occured. Please report this error to support to have it fixed.`;
        } else {
          this.otherError = `Error H-03 occured. Please report this error to support to have it fixed.`;
        }
      });
  }

  private getRejectedWorkorders(): void {
    const workordersQuery = query(
      this.workordersCollectionReference,
      orderBy('workorder.number'),
      where('approved.status', '==', false),
      where('rejected.status', '==', true),
      where('supervisor.uid', '==', this.userUid)
    );

    this.workordersService.getWorkorders(workordersQuery)
      .then((workorders: IntWorkorder[]) => {
        this.rejectedWorkordersSet = true;
        this.rejectedWorkorders = workorders;
        this.hideSpinnerOnSuccess();

      }).catch((err: any) => {
        this.hideSpinnerOnError();
        if (err.code === 'failed-precondition') {
          this.indexingError = `Error IND-H-04 occured. Please report this error to support to have it fixed.`;
        } else {
          this.otherError = `Error H-04 occured. Please report this error to support to have it fixed.`;
        }
      });
  }

  private getOtherApprovedWorkorders(): void {
    const workordersQuery = query(
      this.workordersCollectionReference,
      orderBy('workorder.number'),
      where('approved.status', '==', true),
      where('rejected.status', '==', false),
      where('raiser.uid', '==', this.userUid)
    );

    this.workordersService.getWorkorders(workordersQuery)
      .then((workorders: IntWorkorder[]) => {
        this.approvedWorkordersSet = true;
        this.approvedWorkorders = workorders;
        this.hideSpinnerOnSuccess();

      }).catch((err: any) => {
        this.hideSpinnerOnError();
        console.log('ERROR H09', err);
        if (err.code === 'failed-precondition') {
          this.indexingError = `Error IND-H-05 occured. Please report this error to support to have it fixed.`;
        } else {
          this.otherError = `Error H-05 occured. Please report this error to support to have it fixed.`;
        }
      });
  }

  private getOtherRejectedWorkorders(): void {
    const workordersQuery = query(
      this.workordersCollectionReference,
      orderBy('workorder.number'),
      where('approved.status', '==', false),
      where('rejected.status', '==', true),
      where('raiser.uid', '==', this.userUid)
    );

    this.workordersService.getWorkorders(workordersQuery)
      .then((workorders: IntWorkorder[]) => {
        this.rejectedWorkordersSet = true;
        this.rejectedWorkorders = workorders;
        this.hideSpinnerOnSuccess();

      }).catch((err: any) => {
        this.hideSpinnerOnError();
        if (err.code === 'failed-precondition') {
          this.indexingError = `Error IND-H-06 occured. Please report this error to support to have it fixed.`;
        } else {
          this.otherError = `Error H-06 occured. Please report this error to support to have it fixed.`;
        }
      });
  }

  private getEngTechnicianOpenWorkorders(): void {
    const workordersQuery = query(
      this.workordersCollectionReference,
      orderBy('workorder.number'),
      where('approved.status', '==', true),
      where('rejected.status', '==', false),
      where('closed.status', '==', false),
      where('technician.uid', '==', this.userUid)
    );

    this.workordersService.getWorkorders(workordersQuery)
      .then(
        (workorders: IntWorkorder[]) => {
          this.engTechnicianOpenWorkordersSet = true;
          this.engTechnicianOpenWorkorders = workorders;
          this.hideSpinnerOnSuccess();

        }
      ).catch((err: any) => {
        this.hideSpinnerOnError();
        if (err.code === 'failed-precondition') {
          this.indexingError = `Error IND-H-07 occured. Please report this error to support to have it fixed.`;
        } else {
          this.otherError = `Error H-07 occured. Please report this error to support to have it fixed.`;
        }
      });
  }

  private getEngTechnicianClosedWorkorders(): void {
    const workordersQuery = query(
      this.workordersCollectionReference,
      orderBy('workorder.number'),
      where('closed.status', '==', true),
      where('approved.status', '==', true),
      where('rejected.status', '==', false),
      where('technician.uid', '==', this.userUid)
    );

    this.workordersService.getWorkorders(workordersQuery)
      .then((workorders: IntWorkorder[]) => {
        this.engTechnicianClosedWorkordersSet = true;
        this.engTechnicianClosedWorkorders = workorders;
        this.hideSpinnerOnSuccess();

      }).catch((err: any) => {
        this.hideSpinnerOnError();
        if (err.code === 'failed-precondition') {
          this.indexingError = `Error IND-H-08 occured. Please report this error to support to have it fixed.`;
        } else {
          this.otherError = `Error H-08 occured. Please report this error to support to have it fixed.`;
        }
      });
  }

  private getStoresTechnicianOpenWorkorders(): void {
    const workordersQuery = query(
      this.workordersCollectionReference,
      orderBy('workorder.number'),
      where('approved.status', '==', true),
      where('rejected.status', '==', false),
      where('closed.status', '==', false),
      where('storesTechnician.uid', '==', this.userUid)
    );

    this.workordersService.getWorkorders(workordersQuery)
      .then(
        (workorders: IntWorkorder[]) => {
          this.storesTechnicianOpenWorkordersSet = true;
          this.storesTechnicianOpenWorkorders = workorders;
          this.hideSpinnerOnSuccess();

        }
      ).catch((err: any) => {
        this.hideSpinnerOnError();
        if (err.code === 'failed-precondition') {
          this.indexingError = `Error IND-H-09 occured. Please report this error to support to have it fixed.`;
        } else {
          this.otherError = `Error H-09 occured. Please report this error to support to have it fixed.`;
        }
      });
  }

  private getStoresTechnicianClosedWorkorders(): void {
    const workordersQuery = query(
      this.workordersCollectionReference,
      orderBy('workorder.number'),
      where('closed.status', '==', true),
      where('approved.status', '==', true),
      where('rejected.status', '==', false),
      where('storesTechnician.uid', '==', this.userUid)
    );

    this.workordersService.getWorkorders(workordersQuery)
      .then((workorders: IntWorkorder[]) => {
        this.storesTechnicianClosedWorkordersSet = true;
        this.storesTechnicianClosedWorkorders = workorders;
        this.hideSpinnerOnSuccess();

      }).catch((err: any) => {
        this.hideSpinnerOnError();
        if (err.code === 'failed-precondition') {
          this.indexingError = `Error IND-H-10 occured. Please report this error to support to have it fixed.`;
        } else {
          this.otherError = `Error H-10 occured. Please report this error to support to have it fixed.`;
        }
      });
  }

  resendVerificationCode(): any {
    console.log('THE USER before, ', this.user);
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
