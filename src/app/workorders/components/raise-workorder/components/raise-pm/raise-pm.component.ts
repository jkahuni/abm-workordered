import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// services
import { HotToastService } from '@ngneat/hot-toast';
import { NgxSpinnerService } from 'ngx-spinner';
import { WorkordersService } from '@workorders/services/workorders.service';

// interfaces
import { IntMachine, IntSection, IntUser, IntWorkorder } from '@workorders/models/workorders.models';

// dayjs for time and dates
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-raise-pm',
  templateUrl: './raise-pm.component.html',
  styleUrls: ['./raise-pm.component.scss']
})
export class RaisePmComponent implements OnInit {

  constructor(
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toast: HotToastService,
    private workordersService: WorkordersService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  form!: FormGroup;
  raiser!: IntUser;
  supervisors!: IntUser[];
  electricalTechnicians!: IntUser[];
  mechanicalTechnicians!: IntUser[];
  storesTechnicians!: IntUser[];
  sections!: IntSection[];
  machines!: IntMachine[];
  now!: string;
  userUid!: string | null;

  loading = false;
  showErrorMessage = false;

  ngOnInit(): void {
    this.showSpinner();

    this.userUid = this.route.snapshot.paramMap.get('userUid');

    this.now = dayjs().format();

    this.newWorkorderSetup();
  }

  private showSpinner(): void {
    this.loading = true;
    this.spinner.show('app-raise-new-workorder-spinner');
    this.toast.close();
  }

  private hideSpinner(): void {
    this.loading = false;
    this.spinner.hide('app-raise-new-workorder-spinner');
  }

  private hideSpinnerOnSuccess(): void {
    if (this.raiser) {
      this.createForm();
      this.hideSpinner();
    }
  }

  private hideSpinnerOnError(): void {
    this.showErrorMessage = true;
    this.hideSpinner();
  }

  private formatDate(): string {
    return dayjs(this.now).format('MMM DD, YYYY');
  }

  private formatTime(): string {
    return dayjs(this.now).format('HH:mm:ss');
  }

  private generateWorkorderNumber(): string {
    const date = dayjs(this.now).format('DD:MM:YY');
    const time = this.formatTime();

    return date + '-' + time;
  }

  private generateWorkorderUid(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let uidSuffix = '';

    for (let i = 0; i <= 13; i++) {
      uidSuffix += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const workorderUid = 'pm-' + this.generateWorkorderNumber() + uidSuffix;

    return workorderUid;
  }

  private newWorkorderSetup(): void {
    if (this.userUid) {
      this.workordersService.getCurrentUser(this.userUid)
        .then((firestoreUserObject: IntUser) => {
          // get current user - raiser
          this.raiser = firestoreUserObject;
          this.hideSpinnerOnSuccess();
        })
        .then(() => {
          this.workordersService.getAllUsers().then(
            (firestoreUsers: IntUser[]) => {
              this.electricalTechnicians = firestoreUsers.filter(
                (firestoreUser: IntUser) =>
                  firestoreUser.role === 'Technician' && firestoreUser.technicianRole === 'Electrical');
              this.mechanicalTechnicians = firestoreUsers.filter(
                (firestoreUser: IntUser) =>
                  firestoreUser.role === 'Technician' && firestoreUser.technicianRole === 'Mechanical');
              this.storesTechnicians = firestoreUsers.filter(
                (firestoreUser: IntUser) => firestoreUser.role === 'Technician' && firestoreUser.technicianRole === 'Eng. Store'
                  || firestoreUser.technicianRole === 'PM Planning'
              );
              this.supervisors = firestoreUsers.filter((firestoreUser: IntUser) => firestoreUser.role === 'Supervisor');

            }
          );
        })
        .then(() => {
          this.workordersService.getSections()
            .then((sections: IntSection[]) => {
              this.sections = sections;
            });
        })
        .then(() => {
          this.workordersService.getMachines()
            .then((machines: IntMachine[]) => {
              this.machines = machines;
            });
        })
        .catch((err: any) => {
          this.hideSpinnerOnError();

          console.log('RAISE PM ERROR', err)

        });
    }
  }

  private createForm(): FormGroup {
    const form = this.fb.group({
      // hidden fields
      workorderUid: [this.generateWorkorderUid()],
      raiser: [this.raiser],
      dateTimeRaised: [this.now],
      workorderType: ['PM'],

      // visible fields
      workorderNumber: [this.generateWorkorderNumber()],
      raiserFullName: [this.raiser.fullName],
      dateRaised: [this.formatDate()],
      timeRaised: [this.formatTime()],
      section: ['', Validators.required],
      machine: ['', Validators.required],
      workorderDescription: ['', Validators.required],
      supervisor: ['', Validators.required],
      technician: ['', Validators.required],
      storesTechnician: ['', Validators.required]
    });

    return this.form = form;
  }

  // form getters
  get section(): { [key: string]: AbstractControl } {
    return this.form.get('section')?.value;
  }

  // save w/o
  raiseWorkorder(): void {
    // required variables
    const {
      workorderUid,
      raiser,
      dateTimeRaised,
      workorderType,
      workorderNumber,
      section,
      machine,
      workorderDescription,
      supervisor,
      technician,
      storesTechnician
    } = this.form.value;

    if (!this.form.valid) {
      this.toast.error(`Error. Please ensure all required fields are not blank or invalid.`, {
        duration: 10000,
        id: 'raise-pm-workorder-error-1'
      });
    } else {
      this.showSpinner();

      // workorder data
      const workorderData: IntWorkorder = {
        sparesUsed: {
          status: false,
          spares: [],
          totalCost: ''
        },
        breakdown: {
          status: false,
          dateTime: ''
        },
        approved: {
          status: false,
          dateTime: ''
        },
        rejected: {
          status: false,
          dateTime: ''
        },
        acknowledged: {
          status: false,
          dateTime: ''
        },
        done: {
          status: false,
          dateTime: ''
        },
        closed: {
          status: false,
          dateTime: ''
        },
        timeTaken: {
          fromTimeRaised: '',
          fromTimeApproved: '',
          fromTimeAcknowledged: '',
          fromTimeMachineStopped: ''
        },
        raiser,
        raised: {
          dateTime: dateTimeRaised
        },
        workorder: {
          number: workorderNumber,
          uid: workorderUid,
          type: workorderType,
          description: workorderDescription
        },
        section,
        machine,
        technician,
        storesTechnician,
        supervisor,
        toolChange: {
          from: '',
          to: ''
        },
        moldService: {
          number: '',
          partsServiced: ''
        },
        abnormalityCard: {
          status: false,
          amStep: 0
        },
      };

      // persist w/o to db
     this.workordersService.raiseWorkorder(workorderData)
        .then(() => {
          this.hideSpinner();
          this.toast.success(`Success. Workorder ${workorderNumber} raised successfully.`,
            { duration: 10000, id: 'raise-pm-workorder-success' });
          this.router.navigate(['/']);


        })
        .catch((err: any) => {
          this.hideSpinner();
          
          console.log('ERR IN WORKORDER', err);
          

          this.toast.error(`Failed. Raising workorder ${workorderNumber} failed with error code PM-02. Please try again or report the error code to support for assistance.`, {
            duration: 8000, id: 'raise-pm-workorder-error-2'
          });


        });
    }
  }


}
