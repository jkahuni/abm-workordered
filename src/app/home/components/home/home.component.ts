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
    this.spinner.show('app-home-spinner');

    onAuthStateChanged(this.auth,
      (user: User | null) => {
        this.user = user;
        if (user !== null) {

          this.userUid = user.uid;
          if (!user.emailVerified) {
            this.hideSpinnerOnError();

          } else {
            this.workordersService.getCurrentUser(this.userUid)
              .then((firestoreUser: IntUser) => {
                //  user is a supervisor
                if (firestoreUser.role === 'Supervisor') {
                  this.getRaisedWorkorders();
                  this.getUnverifiedWorkorders();
                  this.getApprovedWorkorders();
                  this.getRejectedWorkorders();
                  this.isSupervisor = true;
                }
                // user is a technician
                else if (firestoreUser.role === 'Technician') {
                  // eng technician
                  if (firestoreUser.technicianRole === 'Electrical'
                    ||
                    firestoreUser.technicianRole === 'Mechanical') {

                    this.getEngTechnicianOpenWorkorders();
                    this.getEngTechnicianClosedWorkorders();
                    this.isEngineeringTechnician = true;
                    this.technicianType = 'engineering';
                  }

                  // stores technician
                  else if (
                    firestoreUser.technicianRole === 'Eng. Store'
                    ||
                    firestoreUser.technicianRole === 'PM Planning'
                  ) {
                    this.getStoresTechnicianOpenWorkorders();
                    this.getStoresTechnicianClosedWorkorders();
                    this.isStoresTechnician = true;
                    this.technicianType = 'stores';
                  }

                }

                // user is not technician/supervisor
                else {
                  this.getRaisedWorkorders();
                  this.isOperatorOrOperatorLike = true;

                }
              })
              .catch((err: any) => {
                this.spinner.hide('app-home-spinner');
                console.log('HOME INIT METHOD', err);
                this.toast.error(`An unknownn error occured. Please reload the page.`);

              });
          }
        } else {
          this.hideSpinnerOnError();

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
      this.spinner.hide('app-home-spinner');
    } else if (
      this.isSupervisor &&
      this.unverifiedWorkordersSet &&
      this.approvedWorkordersSet &&
      this.rejectedWorkordersSet) {
      this.spinner.hide('app-home-spinner');

    } else if (
      this.isEngineeringTechnician &&
      this.engTechnicianOpenWorkordersSet &&
      this.engTechnicianClosedWorkordersSet
    ) {
      this.spinner.hide('app-home-spinner');

    } else if (
      this.isStoresTechnician &&
      this.storesTechnicianClosedWorkordersSet &&
      this.storesTechnicianOpenWorkordersSet
    ) {
      this.spinner.hide('app-home-spinner');

    }
  }

  private hideSpinnerOnError(): void {
    this.spinner.hide('app-home-spinner');

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
        console.log('ERROR H01', err);
        this.hideSpinnerOnError();

        this.toast.error('Error Code H01: An error occured. Please report this code to support to have it fixed.', { duration: 8000 });
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
        console.log('ERROR H02', err);
        this.toast.error('Error Code H02: An error occured. Please report this code to support to have it fixed.', { duration: 8000 });
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
        console.log('ERROR H03', err);
        this.toast.error('Error Code H03: An error occured. Please report this code to support to have it fixed.', { duration: 8000 });
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
        console.log('ERROR H04', err);
        this.toast.error('Error Code H04: An error occured. Please report this code to support to have it fixed.', { duration: 8000 });
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
        console.log('ERROR H05', err);
        this.toast.error('Error Code H05: An error occured. Please report this code to support to have it fixed.', { duration: 8000 });
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
        console.log('ERROR H06', err);
        this.toast.error('Error Code H06: An error occured. Please report this code to support to have it fixed.', { duration: 8000 });
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
        console.log('ERROR H07', err);
        this.toast.error('Error Code H07: An error occured. Please report this code to support to have it fixed.', { duration: 8000 });
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
        console.log('ERROR H08', err);
        this.toast.error('Error Code H08: An error occured. Please report this code to support to have it fixed.', { duration: 8000 });
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
          console.log('THE then block, ', this.user);

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
