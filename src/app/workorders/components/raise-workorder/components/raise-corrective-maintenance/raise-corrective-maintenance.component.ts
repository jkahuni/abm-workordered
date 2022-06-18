import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
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
export class RaiseCorrectiveMaintenanceComponent implements OnInit, OnChanges {

  @Input('sections') allSections!: IntSection[];
  @Input('machines') allMachines!: IntMachine[];
  @Input('raiser') currentUser!: IntUser;

  form!: FormGroup;
  raiser!: IntUser;
  sections!: IntSection[];
  machines!: IntMachine[];
  now!: string;

  loading = true;
  loadingFailed = false;

  workorderNumber!: string;
  workorderUid!: string;

  constructor(
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private toast: HotToastService,
    private workordersService: WorkordersService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.spinner.show('app-raise-new-workorder-spinner');

    const raiser = changes['currentUser']?.currentValue as IntUser;
    const sections = changes['allSections']?.currentValue as IntSection[];
    const machines = changes['allMachines']?.currentValue as IntMachine[];

    this.raiser = raiser ? raiser : this.raiser;
    this.sections = sections ? sections : this.sections;
    this.machines = machines ? machines : this.machines;

    if (this.raiser !== undefined && this.sections !== undefined && this.machines !== undefined) {

      this.now = dayjs().format();

      this.workorderNumber = this.generateWorkorderNumber();
      this.workorderUid = this.generateWorkorderUid();

      this.createForm();
    }
  }

  ngOnInit(): void {

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


  private formatDate(): string {
    return dayjs(this.now).format('MMM DD, YYYY');
  }

  private formatTime(): string {
    return dayjs(this.now).format('HH:mm:ss');
  }

  private generateWorkorderNumber(): string {
    const numberPrefix = 'cm-';
    const numberSuffix = [...Array(6)].map(() => Math.random() * 10 | 0).join(``);

    return numberPrefix + numberSuffix;
  }

  private generateWorkorderUid(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let uidSuffix = '';

    for (let i = 0; i <= 13; i++) {
      uidSuffix += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const workorderUid = this.workorderNumber + uidSuffix;

    return workorderUid;
  }


  private createForm(): FormGroup {
    const form = this.fb.group({
      // hidden fields
      workorderUid: [this.workorderUid],
      raiser: [this.raiser],
      dateTimeRaised: [this.now],
      workorderType: ['Corrective Maintenance'],

      // visible fields
      workorderNumber: [this.workorderNumber],
      raiserFullName: [this.raiser.fullName],
      dateRaised: [this.formatDate()],
      timeRaised: [this.formatTime()],
      section: ['', Validators.required],
      machine: ['', Validators.required],
      workorderDescription: ['', Validators.required],
    });

    this.hideSpinner();

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
        viewedByTechnician: {
          status: false,
          dateTime: ''

        },
        review: {
          status: '',
          concern: {},
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
          this.workordersService.refreshWorkorders('', workorderData);
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
