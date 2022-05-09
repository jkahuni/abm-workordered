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
  selector: 'app-raise-corrective-maintenance',
  templateUrl: './raise-corrective-maintenance.component.html',
  styleUrls: ['./raise-corrective-maintenance.component.scss']
})
export class RaiseCorrectiveMaintenanceComponent implements OnInit {

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
  productionSupervisors!: IntUser[];
  engineeringSupervisors!: IntUser[];
  electricalTechnicians!: IntUser[];
  mechanicalTechnicians!: IntUser[];
  storesTechnicians!: IntUser[];
  sections!: IntSection[];
  machines!: IntMachine[];
  now!: string;
  userUid!: string | null;

  loading = false;
  loadingFailed = false;
  getUserError!: string;
  getUsersError!: string;
  getSectionsError!: string;
  getMachinesError!: string;
  defaultErrorMessage = `Error UCM-01 occured while configuring your workorder. 
  Please reload the page or report the error code to support for assistance.`;

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
    if (
      this.raiser &&
      this.storesTechnicians &&
      this.engineeringSupervisors &&
      this.machines
    ) {
      this.createForm();
      this.hideSpinner();
    }
  }

  private hideSpinnerOnError(): void {
    this.loadingFailed = true;
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

    const workorderUid = 'cm-' + this.generateWorkorderNumber() + uidSuffix;

    return workorderUid;
  }

  private newWorkorderSetup(): void {
    if (this.userUid) {
      this.getUser(this.userUid);
      this.getUsers();
      this.getSections();
      this.getMachines();
    }
  }

  private getUser(userUid: string): void {
    this.workordersService.getUser(userUid)
      .then((user: IntUser) => {
        this.raiser = user;
        this.hideSpinnerOnSuccess();
      })
      .catch((err: any) => {
        this.hideSpinnerOnError();
        if (err.code === 'failed-precondition') {
          this.getUserError = `Configuring your new workorder failed with error code IND-CM-01. Please report this error code to support to have it resolved.`;
        } else {
          this.getUserError = `Configuring your new workorder failed with error code CM-01. Please report this error code to support to have it resolved.`;
        }
      });
  }

  private getUsers(): void {
    this.workordersService.getUsers()
      .then(
        (firestoreUsers: IntUser[]) => {
          this.electricalTechnicians = firestoreUsers.filter(
            (firestoreUser: IntUser) =>
              firestoreUser.group === 'Technician' && firestoreUser.technicianGroup === 'Electrical');
          this.mechanicalTechnicians = firestoreUsers.filter(
            (firestoreUser: IntUser) =>
              firestoreUser.group === 'Technician' && firestoreUser.technicianGroup === 'Mechanical');
          this.storesTechnicians = firestoreUsers.filter(
            (firestoreUser: IntUser) => firestoreUser.group === 'Technician' && firestoreUser.technicianGroup === 'Eng. Store'
              || firestoreUser.technicianGroup === 'PM Planning'
          );
          this.productionSupervisors = firestoreUsers.filter((firestoreUser: IntUser) => firestoreUser.group === 'Supervisor' && firestoreUser.supervisorGroup === 'Production');
          this.engineeringSupervisors = firestoreUsers.filter((firestoreUser: IntUser) => firestoreUser.group === 'Supervisor' && firestoreUser.supervisorGroup === 'Engineering');
          this.hideSpinnerOnSuccess();

        })
      .catch((err: any) => {
        this.hideSpinnerOnError();
        if (err.code === 'failed-precondition') {
          this.getUsersError = `Configuring your new workorder failed with error code IND-CM-02. Please report this error code to support to have it resolved.`;
        } else {
          this.getUsersError = `Configuring your new workorder failed with error code CM-02. Please report this error code to support to have it resolved.`;
        }
      });
  }

  private getSections(): void {
    this.workordersService.getSections()
      .then((sections: IntSection[]) => {
        this.sections = sections;
        this.hideSpinnerOnSuccess();
      })
      .catch((err: any) => {
        this.hideSpinnerOnError();
        if (err.code === 'failed-precondition') {
          this.getSectionsError = `Configuring your new workorder failed with error code IND-CM-03. Please report this error code to support to have it resolved.`;

        } else {
          this.getSectionsError = `Configuring your new workorder failed with error code CM-03. Please report this error code to support to have it resolved.`;

        }
      });
  }

  private getMachines(): void {
    this.workordersService.getMachines()
      .then((machines: IntMachine[]) => {
        this.machines = machines;
        this.hideSpinnerOnSuccess();
      })
      .catch((err: any) => {
        this.hideSpinnerOnError();
        if (err.code === 'failed-precondition') {
          this.getMachinesError = `Configuring your new workorder failed with error code IND-CM-04. Please report this error code to support to have it resolved.`;
        } else {
          this.getMachinesError = `Configuring your new workorder failed with error code CM-04. Please report this error code to support to have it resolved.`;
        }
      });
  }

  private createForm(): FormGroup {
    const form = this.fb.group({
      // hidden fields
      workorderUid: [this.generateWorkorderUid()],
      raiser: [this.raiser],
      dateTimeRaised: [this.now],
      workorderType: ['Corrective Maintenance'],

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

  raiseWorkorder(): void {
    const {
      workorderUid,
      workorderNumber,
      raiser,
      dateTimeRaised,
      workorderType,
      section,
      machine,
      workorderDescription,
      supervisor,
      technician,
      storesTechnician,
    } = this.form.value;


    if (this.form?.invalid) {
      this.toast.error(`Error. Please ensure all required fields are not blank or invalid.`, {
        duration: 10000,
        id: 'raise-corrective-maintenance-workorder-error-1'
      });
    }

    else {
      this.showSpinner();

      const workorderData: IntWorkorder = {
        review: {
          status: '',
          concerns: [],
          dateTime: ''
        },
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

      this.workordersService.raiseWorkorder(workorderData)
        .then(() => {
          this.hideSpinner();
          this.toast.success(`Success. Workorder ${workorderNumber} raised successfully.`,
            { duration: 10000, id: 'raise-corrective-maintenance-workorder-success' });
          this.router.navigate(['/']);
        })
        .catch((err: any) => {
          this.hideSpinner();
          console.log('ERR IN BD -WORKORDER', err);


          this.toast.error(`Failed. Raising workorder ${workorderNumber} failed with error code CM-05. Please try again or report the error code to support for assistance.`, {
            duration: 8000, id: 'raise-corrective-maintenance-workorder-error-2'
          }
          );
        });


    }







  }

}

