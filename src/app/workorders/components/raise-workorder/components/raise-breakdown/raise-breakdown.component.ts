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
  selector: 'app-raise-breakdown',
  templateUrl: './raise-breakdown.component.html',
  styleUrls: ['./raise-breakdown.component.scss']
})
export class RaiseBreakdownComponent implements OnInit, OnChanges {

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
    private router: Router
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

  private formatBreakdownDate(): Date {
    return new Date(dayjs(this.now).format('MM/DD/YYYY'));
  }

  private generateWorkorderNumber(): string {
    const numberPrefix = 'bd-';
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

      // visible fields
      workorderType: ['Breakdown'],
      workorderNumber: [this.workorderNumber],
      raiserFullName: [this.raiser.fullName],
      dateRaised: [this.formatDate()],
      timeRaised: [this.formatTime()],
      dateMachineStopped: [this.formatBreakdownDate(), Validators.required],
      timeMachineStopped: [this.formatTime(), Validators.required],
      section: ['', Validators.required],
      machine: ['', Validators.required],
      workorderDescription: ['', Validators.required]
    });

    this.hideSpinner();
    return this.form = form;
  }

  private formatBreakdownDateAsDayjsObject(date: Date, time: string): string {
    const yearValue = date.getFullYear();
    // adding 1 because of 0-based system of Date and dayjs
    const monthValue = date.getMonth() + 1;
    const dateValue = date.getDate();

    const dateTimeString = yearValue + '-' + monthValue + '-' + dateValue + 'T' + time;

    return dayjs(dateTimeString).format();
  }

  private validateBreakdownDateTime(stopped: string): boolean {
    const raisedDatetime = dayjs(this.now);
    const stoppedDatetime = dayjs(stopped);

    return !stoppedDatetime.isAfter(raisedDatetime);
  }

  // form getters
  get section(): { [key: string]: AbstractControl } {
    return this.form.get('section')?.value;
  }

  // for dates filter
  filterDates(date: Date | null): boolean {
    // selected date
    const inputDateMilliseconds = (date || new Date()).getTime();
    const dayJsMilliseconds = new Date(dayjs().format('MM/DD/YYYY')).getTime();

    const timeDifference = dayJsMilliseconds - inputDateMilliseconds;


    return timeDifference >= 0;
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
      dateMachineStopped,
      timeMachineStopped,
    } = this.form.value;

    const breakdownDatetime = this.formatBreakdownDateAsDayjsObject(dateMachineStopped, timeMachineStopped);

    const breakdownDatetimeValid = this.validateBreakdownDateTime(breakdownDatetime);

    if (!breakdownDatetimeValid) {
      return this.form?.get('timeMachineStopped')?.setErrors({ invalidTime: true });
    }

    else if (this.form?.invalid) {
      this.toast.error(`Error. Please ensure all required fields are not blank or invalid.`, {
        duration: 10000,
        id: 'raise-breakdown-workorder-error-1'
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
          status: true,
          dateTime: breakdownDatetime
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
            { duration: 10000, id: 'raise-breakdown-workorder-success' });
          this.workordersService.refreshWorkorders('', workorderData);
          this.router.navigate(['/']);
        })
        .catch((err: any) => {
          this.hideSpinner();
          console.log('ERR IN BD -WORKORDER', err);


          this.toast.error(`Failed. Raising breakdown workorder ${workorderNumber} failed with error code B-02. Please try again or forward the error code to support for assistance.`, {
            duration: 8000, id: 'raise-breakdown-workorder-error-2'
          }
          );
        });
    }
  }
}
