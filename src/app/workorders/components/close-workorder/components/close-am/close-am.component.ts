import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

// dayjs
import * as dayjs from 'dayjs';

// interfaces
import { IntWorkorder, IntSpareWithQuantities, IntCloseWorkorderData } from '@workorders/models/workorders.models';

// services
import { WorkordersService } from '@workorders/services/workorders.service';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-close-am',
  templateUrl: './close-am.component.html',
  styleUrls: ['./close-am.component.scss']
})
export class CloseAmComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workordersService: WorkordersService,
    private toast: HotToastService,
    private fb: FormBuilder
  ) { }

  // template references
  @ViewChild('loadingWorkorderSpinner') loadingWorkorderSpinner!: ElementRef;
  @ViewChild('closingWorkorderButtonSpinner') closingWorkorderButtonSpinner!: ElementRef;

  workorder!: IntWorkorder;
  form!: FormGroup;

  userUid!: string | null;
  workorderUid!: string | null;

  loadingWorkorder = false;
  closingWorkorder = false;
  showErrorMessage = false;
  workorderClosed = false;


  ngOnInit(): void {
    this.showBootstrapSpinner();
    this.userUid = this.route.snapshot.paramMap.get('userUid');
    this.workorderUid = this.route.snapshot.paramMap.get('workorderUid');

    this.getWorkorder();
  }

  // show spinner
  private showBootstrapSpinner(): void {
    this.loadingWorkorder = true;
    if (this.loadingWorkorderSpinner) {
      this.loadingWorkorderSpinner.nativeElement.style.display = 'block';
    }

  }

  private hideBootstrapSpinner(): void {
    this.loadingWorkorder = false;
    if (this.loadingWorkorderSpinner) {
      this.loadingWorkorderSpinner.nativeElement.style.display = 'none';
    }

  }

  private hideSpinnerOnError(): void {
    this.hideBootstrapSpinner();
    this.showErrorMessage = true;

  }

  private showButtonSpinner(): void {
    this.closingWorkorder = true;
    if (this.closingWorkorderButtonSpinner) {
      this.closingWorkorderButtonSpinner.nativeElement.style.display = 'block';
    }

  }

  private hideButtonSpinnerOnSuccess(): void {
    this.workorderClosed = true;
    this.closingWorkorder = false;
    if (this.closingWorkorderButtonSpinner) {
      this.closingWorkorderButtonSpinner.nativeElement.style.display = 'none';
    }

  }

  private hideButtonSpinnerOnError(): void {
    this.closingWorkorder = false;
    if (this.closingWorkorderButtonSpinner) {
      this.closingWorkorderButtonSpinner.nativeElement.style.display = 'none';
    }

  }

  private getWorkorder(): any {
    if (this.workorderUid) {
      this.workordersService.getWorkorder(this.workorderUid)
        .then((workorder: IntWorkorder) => {
          this.workorder = workorder;
          this.form = this.createForm(workorder);
          this.hideBootstrapSpinner();
        })
        .catch((err: any) => {
          console.log('ERR LOADING WORKORDER, ', err, err.code, err.message);
          this.hideSpinnerOnError();

        });

    }
  }

  private formatDate(dateTime: string): string {
    return dayjs(dateTime).format('DD MMM, YYYY');
  }

  private formatTime(dateTime: string): string {
    return dayjs(dateTime).format('HH:mm:ss');
  }

  private createForm(workorder: IntWorkorder): FormGroup {
    const form = this.fb.group({
      workorderUid: [workorder.workorder.uid],
      workorderNumber: [workorder.workorder.number],
      workorderType: [workorder.workorder.type],
      workorderDescription: [workorder.workorder.description ? workorder.workorder.description :
        'no description provided.'],
      raiser: [workorder.raiser.fullName],
      supervisor: [workorder.supervisor.fullName],
      technician: [workorder.technician.fullName],
      storesTechnician: [workorder.storesTechnician.fullName],
      dateRaised: [this.formatDate(workorder.raised.dateTime)],
      timeRaised: [this.formatTime(workorder.raised.dateTime)],
      dateApproved: [this.formatDate(workorder.approved.dateTime)],
      timeApproved: [this.formatTime(workorder.approved.dateTime)],
      section: [workorder.section.name],
      machine: [workorder.machine.name],
      sparesUsedArray: this.fb.array(workorder.sparesUsed.status ?
        [...this.getIssuedSpares(workorder.sparesUsed.spares)]
        :
        []),
      totalSparesCost: [workorder.sparesUsed.totalCost],

      machineSubAssembly: ['', Validators.required],
      maintenanceActions: ['', Validators.required]
    });

    return form;
  }

  // if any, get spares issued through the workorder
  private getIssuedSpares(spares: IntSpareWithQuantities[]): FormGroup[] {
    const sparesArray: FormGroup[] = [];
    spares.map((spare: IntSpareWithQuantities) => {
      const { code, quantity, totalCost } = spare;
      const form = this.fb.group({
        code,
        quantity,
        totalCost
      });
      sparesArray.push(form);
    });

    return sparesArray;
  }

  // form getters
  get sparesUsedArray(): any {
    return this.form?.get('sparesUsedArray') as FormArray;
  }

  get getTotalSparesCost(): string {
    return this.form?.get('totalSparesCost')?.value;
  }

  closeWorkorder(): void {
    const {
      workorderUid,
      workorderNumber,
      maintenanceActions,
      machineSubAssembly
    } = this.form?.value;
    if (
      this.form?.invalid ||
      maintenanceActions === '' ||
      machineSubAssembly === '') {
      this.toast.error(`Error: Please ensure the required fields are not blank or invalid.`, { duration: 5000, id: 'close-workorder-error-2' });
    }

    else {
      this.showButtonSpinner();
      const now = dayjs().format();

      const workorderUpdateData: IntCloseWorkorderData = {
        closed: {
          status: true,
          dateTime: now
        },
        correctiveActions: '',
        rootCause: '',
        moldPartsServiced: '',
        maintenanceActions,
        machineSubAssembly
      };

      this.workordersService.updateWorkorder(workorderUid, workorderUpdateData)
        .then(() => {
          this.hideButtonSpinnerOnSuccess();
          this.workordersService.refreshWorkorders(workorderUid, workorderUpdateData);

          this.router.navigate([`/workorders/engineering/open/${this.userUid}`]);
          this.toast.success(`Success. Workorder ${workorderNumber} closed successfully.`,
            { duration: 10000, id: 'close-workorder-success' });
        })
        .catch((err: any) => {
          this.hideButtonSpinnerOnError();
          console.log('ERR CLOSING W/O, ', err);
          this.toast.error(`Failed. Closing workorder ${workorderNumber} failed with error code CAM-01. Please try again or forward this error code to support for assistance.`, { duration: 8000, id: 'close-workorder-error' });
        });

    }
  }


}
