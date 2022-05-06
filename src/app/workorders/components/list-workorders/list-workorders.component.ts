import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormArray } from '@angular/forms';

// firestore imports
import {
  Query, DocumentData,
  query, orderBy, where,
  Firestore, collection,
  CollectionReference
} from '@angular/fire/firestore';

// services
import { WorkordersService } from '@workorders/services/workorders.service';
import { HotToastService } from '@ngneat/hot-toast';

// interfaces
import { IntUser, IntWorkorder, IntSpareWithQuantities } from '@workorders/models/workorders.models';

// dayjs
import * as dayjs from 'dayjs';


const animationParams = {
  menuWidth: '130px',
  animationStyle: '500ms ease'
};

@Component({
  selector: 'app-list-workorders',
  templateUrl: './list-workorders.component.html',
  styleUrls: ['./list-workorders.component.scss']
})
export class ListWorkordersComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestore: Firestore,
    private workordersService: WorkordersService,
    private toast: HotToastService,
    private fb: FormBuilder
  ) { }

  // template refs
  @ViewChild('loadingWorkordersSpinner') loadingWorkordersSpinner!: ElementRef;

  // button spinners
  @ViewChild('appprovingWorkorderLoadingSpinner') appprovingWorkorderLoadingSpinner!: ElementRef;
  @ViewChild('rejectWorkorderButtonSpinner') rejectWorkorderButtonSpinner!: ElementRef;
  @ViewChild('delegateSupervisorButtonSpinner') delegateSupervisorButtonSpinner!: ElementRef;
  @ViewChild('changeTechniciansButtonSpinner') changeTechniciansButtonSpinner!: ElementRef;
  @ViewChild('assignTechniciansButtonSpinner') assignTechniciansButtonSpinner!: ElementRef;
  @ViewChild('acknowledgeWorkorderLoadingButtonSpinner') acknowledgeWorkorderLoadingButtonSpinner!: ElementRef;
  @ViewChild('markWorkorderDoneLoadingButtonSpinner') markWorkorderDoneLoadingButtonSpinner!: ElementRef;
  @ViewChild('updateEngineeringTechniciansButtonSpinner') updateEngineeringTechniciansButtonSpinner!: ElementRef;
  @ViewChild('updateStoresTechniciansButtonSpinner') updateStoresTechniciansButtonSpinner !: ElementRef;

  // close modals (X on the modal)
  @ViewChild('closeRejectWorkorderModal') closeRejectWorkorderModal!: ElementRef;
  @ViewChild('closeSupervisorHandoverModal') closeSupervisorHandoverModal!: ElementRef;
  @ViewChild('closeChangeTechniciansModal') closeChangeTechniciansModal!: ElementRef;
  @ViewChild('closeAssignTechniciansModal') closeAssignTechniciansModal!: ElementRef;
  @ViewChild('closeEngineeringTechniciansHandoverModal') closeEngineeringTechniciansHandoverModal!: ElementRef;
  @ViewChild('closeStoresTechniciansHandoverModal') closeStoresTechniciansHandoverModal!: ElementRef;


  // route params
  userType!: string | null;
  workordersType!: string | null;
  userUid!: string | null;

  workorders!: IntWorkorder[];
  workorder!: IntWorkorder | undefined;
  workorderUid!: string;

  // form groups
  form!: FormGroup;
  rejectWorkorderForm!: FormGroup;
  changeTechniciansForm!: FormGroup;
  supervisorsHandoverForm!: FormGroup;
  assignTechniciansForm!: FormGroup;
  engTechniciansHandoverForm!: FormGroup;
  storesTechniciansHandoverForm!: FormGroup;


  // for handover templates
  electricalTechnicians!: IntUser[];
  mechanicalTechnicians!: IntUser[];
  storeTechnicians!: IntUser[];
  productionSupervisors!: IntUser[];
  engineeringSupervisors!: IntUser[];

  // showing spares to engineering supervisors
  isEngineeringSupervisor = false;

  // when to show right-sidenav
  workorderHasActions = false;

  // toggle sidenavs
  showLeftSidenav = true;
  showRightSidenav = false;

  // loading spinners
  loadingWorkorders = true;

  // for different actions updating the workorder
  approveWorkorderLoading = false;
  rejectWorkorderLoading = false;
  supervisorHandoverLoading = false;
  changeTechniciansLoading = false;
  assignTechniciansLoading = false;
  acknowledgeWorkorderLoading = false;
  markWorkorderDoneLoading = false;
  engTechnicianHandoverLoading = false;
  storesTechnicianHandoverLoading = false;


  ngOnInit(): void {
    this.userType = this.route.snapshot.paramMap.get('userType');
    this.workordersType = this.route.snapshot.paramMap.get('workordersType');
    this.userUid = this.route.snapshot.paramMap.get('userUid');

    this.getWorkorders();
    this.getUsers();

    this.createModalForms();
  }

  // create query
  private createWorkordersQuery(): Query<DocumentData> | undefined {
    const workordersColRef: CollectionReference<DocumentData> = collection(this.firestore, 'workorders');
    if (
      this.userType &&
      this.workordersType &&
      this.userUid
    ) {
      // supervisor
      if (this.userType === 'supervisor') {
        // unverified workorders
        if (this.workordersType === 'unverified') {
          const unverifiedWorkordersQuery = query(
            workordersColRef,
            orderBy('workorder.number'),
            where('approved.status', '==', false),
            where('rejected.status', '==', false),
            where('supervisor.uid', '==', this.userUid)
          );

          // additional supervisor actions
          this.workorderHasActions = true;
          return unverifiedWorkordersQuery;
        }

        // approved workorders
        else if (this.workordersType === 'approved') {
          const approvedWorkordersQuery = query(
            workordersColRef,
            orderBy('workorder.number'),
            where('approved.status', '==', true),
            where('rejected.status', '==', false),
            where('supervisor.uid', '==', this.userUid));

          return approvedWorkordersQuery;

        }

        // rejected workorders
        else if (this.workordersType === 'rejected') {
          const rejectedWorkordersQuery = query(
            workordersColRef,
            orderBy('workorder.number'),
            where('approved.status', '==', false),
            where('rejected.status', '==', true),
            where('supervisor.uid', '==', this.userUid)
          );

          return rejectedWorkordersQuery;

        }

        // raised workorders
        else if (this.workordersType === 'raised') {
          const raisedWorkordersQuery = query(
            workordersColRef,
            orderBy('workorder.number'),
            where('raiser.uid', '==', this.userUid)
          );

          return raisedWorkordersQuery;

        }
      }
      // engineering technician
      else if (this.userType === 'engineering') {
        // eng open workorders
        if (this.workordersType === 'open') {
          const engineeringOpenWorkordersQuery = query(
            workordersColRef,
            orderBy('workorder.number'),
            where('approved.status', '==', true),
            where('rejected.status', '==', false),
            where('closed.status', '==', false),
            where('technician.uid', '==', this.userUid)
          );

          this.workorderHasActions = true;
          return engineeringOpenWorkordersQuery;
        }

        // eng closed workorders
        else if (this.workordersType === 'closed') {
          const engineeringClosedWorkordersQuery = query(
            workordersColRef,
            orderBy('workorder.number'),
            where('approved.status', '==', true),
            where('rejected.status', '==', false),
            where('closed.status', '==', true),
            where('technician.uid', '==', this.userUid)
          );

          return engineeringClosedWorkordersQuery;

        }

      }
      // stores technician
      else if (this.userType === 'stores') {
        // stores open workorders
        if (this.workordersType === 'open') {
          const storesOpenWorkordersQuery = query(
            workordersColRef,
            orderBy('workorder.number'),
            where('approved.status', '==', true),
            where('rejected.status', '==', false),
            where('closed.status', '==', false),
            where('storesTechnician.uid', '==', this.userUid)
          );

          this.workorderHasActions = true;
          return storesOpenWorkordersQuery;
        }

        // stores closed workorders
        else if (this.workordersType === 'closed') {
          const storesOpenWorkordersQuery = query(
            workordersColRef,
            orderBy('workorder.number'),
            where('approved.status', '==', true),
            where('rejected.status', '==', false),
            where('closed.status', '==', true),
            where('storesTechnician.uid', '==', this.userUid)
          );
          this.workorderHasActions = true;
          return storesOpenWorkordersQuery;
        }

      }
      // other types of users
      // (operator, mgr, offices, distribution)
      else if (this.userType === 'other') {
        if (this.workordersType === 'raised') {
          const raisedWorkordersQuery = query(
            workordersColRef,
            orderBy('workorder.number'),
            where('raiser.uid', '==', this.userUid)
          );

          return raisedWorkordersQuery;
        }

        else if (this.workordersType === 'approved') {
          const approvedWorkordersQuery = query(
            workordersColRef,
            orderBy('workorder.number'),
            where('approved.status', '==', true),
            where('rejected.status', '==', false),
            where('raiser.uid', '==', this.userUid)
          );


          return approvedWorkordersQuery;
        }

        else if (this.workordersType === 'rejected') {
          const rejectedWorkordersQuery = query(
            workordersColRef,
            orderBy('workorder.number'),
            where('approved.status', '==', false),
            where('rejected.status', '==', true),
            where('raiser.uid', '==', this.userUid)
          );

          return rejectedWorkordersQuery;
        }
      }
    }
    return;

  }

  // get workorders
  private getWorkorders(): void {
    const workordersQuery = this.createWorkordersQuery();
    if (workordersQuery) {
      this.workordersService.getWorkorders(workordersQuery)
        .then((workorders: IntWorkorder[]) => {
          this.workorders = workorders;
          this.hideLoadingWorkordersSpinner();

        })
        .catch((err: any) => {
          this.hideLoadingWorkordersSpinner();
          this.toast.close();

          this.toast.error(`Error: Loading your workorders failed with error code WL-02.
          Please try reloading the page or report the error code to support for assistance.`,
            { duration: 6000, id: 'error-code-WL-02' });
          console.log('ERROR WL-02', err);


        });
    } else {
      this.hideLoadingWorkordersSpinner();
      this.toast.close();

      this.toast.error(`Error: Loading your workorders failed with error code WL-01.
          Please ensure you are logged in
           then try reloading the page
           or report the error code to support for assistance.`,
        { duration: 8000, id: 'error-code-WL-01' });
    }
  }

  // create modal forms
  private createModalForms(): void {
    this.rejectWorkorderForm = this.createRejectWorkorderForm();
    this.changeTechniciansForm = this.createChangeTechniciansForm();
    this.assignTechniciansForm = this.createAssignTechniciansForm();
    this.supervisorsHandoverForm = this.createSupervisorsHandoverForm();
    this.engTechniciansHandoverForm = this.createEngTechniciansHandoverForm();
    this.storesTechniciansHandoverForm = this.createStoresTechniciansHandoverForm();
  }

  // get all users
  private getUsers(): void {
    this.workordersService.getUsers()
      .then((users: IntUser[]) => {
        this.productionSupervisors = users.filter(
          (user: IntUser) =>
            user.group === 'Supervisor' && user.supervisorGroup === 'Production'
        );
        this.engineeringSupervisors = users.filter(
          (user: IntUser) =>
            user.group === 'Supervisor' && user.supervisorGroup === 'Engineering'
        );

        this.electricalTechnicians = users.filter(
          (user: IntUser) =>
            user.group === 'Technician' && user.technicianGroup === 'Electrical');
        this.mechanicalTechnicians = users.filter(
          (user: IntUser) =>
            user.group === 'Technician' && user.technicianGroup === 'Mechanical');
        this.storeTechnicians = users.filter(
          (user: IntUser) => user.group === 'Technician' && user.technicianGroup === 'Eng. Store'
            || user.technicianGroup === 'PM Planning'
        );

        const engineeringSupervisor = this.engineeringSupervisors.find((user: IntUser) => user.uid === this.userUid);

        if (engineeringSupervisor !== undefined) {
          this.isEngineeringSupervisor = true;
        }

      })
      .catch((err: any) => {
        this.toast.close();

        this.toast.error(`Error: A crucial operation failed with error code WL-03. Please reload the page or report the error code to support to have it fixed.`,
          { duration: 6000, id: 'error-code-WL-03' });
        console.log('ERROR WL-03', err);
      });
  }

  // hide spinners
  private hideLoadingWorkordersSpinner(): void {
    this.loadingWorkorders = false;
    if (this.loadingWorkordersSpinner) {
      this.loadingWorkordersSpinner.nativeElement.style.display = 'none';
    }
  }

  private showLoadingWorkordersSpinner(): void {
    this.loadingWorkorders = true;
    if (this.loadingWorkordersSpinner) {
      this.loadingWorkordersSpinner.nativeElement.style.display = 'block';
    }
  }

  // create forms
  private createForm(workorder: IntWorkorder): FormGroup {
    return this.form = this.fb.group({
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
      dateRejected: [this.formatDate(workorder.rejected.dateTime)],
      timeRejected: [this.formatTime(workorder.rejected.dateTime)],
      rejectionReason: [workorder.rejected.status ? workorder.rejected.reason : ''],
      breakdownDate: [this.formatDate(workorder.breakdown.dateTime)],
      breakdownTime: [this.formatTime(workorder.breakdown.dateTime)],
      dateAcknowledged: [this.formatDate(workorder.acknowledged.dateTime)],
      timeAcknowledged: [this.formatTime(workorder.acknowledged.dateTime)],
      dateDone: [this.formatDate(workorder.done.dateTime)],
      timeDone: [this.formatTime(workorder.done.dateTime)],
      timeFromTimeRaised: [workorder.timeTaken.fromTimeRaised],
      timeFromTimeApproved: [workorder.timeTaken.fromTimeApproved],
      timeFromTimeAcknowledged: [workorder.timeTaken.fromTimeAcknowledged],
      timeFromTimeMachineStopped: [workorder.timeTaken.fromTimeMachineStopped],
      section: [workorder.section.name],
      machine: [workorder.machine.name],
      toolChangeFrom: [workorder.toolChange.from],
      toolChangeTo: [workorder.toolChange.to],
      moldNumber: [workorder.moldService.number],
      amStep: [workorder.abnormalityCard.amStep],
      sparesUsedStatus: [workorder.sparesUsed.status],
      sparesUsedArray: this.fb.array(workorder.sparesUsed.status ?
        [...this.getIssuedSpares(workorder.sparesUsed.spares)]
        :
        []),
      totalSparesCost: [workorder.sparesUsed.totalCost]
    });
  }

  private createRejectWorkorderForm(): FormGroup {
    const form = this.fb.group({
      reason: ['', Validators.required]
    });

    return form;
  }

  private createChangeTechniciansForm(): FormGroup {
    const form = this.fb.group({
      currentEngTechnician: [this.workorder?.technician?.fullName],
      currentStoreTechnician: [
        this.workorder?.storesTechnician?.fullName
      ],
      newEngTechnician: ['', Validators.required],
      newStoreTechnician: ['', Validators.required]
    });

    return form;
  }

  private createAssignTechniciansForm(): FormGroup {
    const form = this.fb.group({
      engTechnician: ['', Validators.required],
      storeTechnician: ['', Validators.required]
    });

    return form;
  }

  private createSupervisorsHandoverForm(): FormGroup {
    const form = this.fb.group({
      currentSupervisor: [this.workorder?.supervisor?.fullName],
      newSupervisor: ['', Validators.required]
    });

    return form;
  }

  private createEngTechniciansHandoverForm(): FormGroup {
    const form = this.fb.group(
      {
        currentTechnician: [this.workorder?.technician?.fullName],
        newTechnician: ['', Validators.required]
      });

    return form;
  }

  private createStoresTechniciansHandoverForm(): FormGroup {
    const form = this.fb.group({
      currentTechnician: [this.workorder?.storesTechnician?.fullName],
      newTechnician: ['', Validators.required]
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

  // updating workorders based on user interaction
  private refreshWorkorders(): void {
    this.showLoadingWorkordersSpinner();
    this.workorder = undefined;
    this.showLeftSidenav = true;
    this.showRightSidenav = false;
    this.getWorkorders();
  }

  private closeButtonSpinners(): void {
    this.toast.close();
    this.approveWorkorderLoading = false;
    this.rejectWorkorderLoading = false;
    this.supervisorHandoverLoading = false;
    this.changeTechniciansLoading = false;
    this.assignTechniciansLoading = false;
    this.acknowledgeWorkorderLoading = false;
    this.markWorkorderDoneLoading = false;
    this.engTechnicianHandoverLoading = false;
    this.storesTechnicianHandoverLoading = false;

    if (this.appprovingWorkorderLoadingSpinner) {
      this.appprovingWorkorderLoadingSpinner.nativeElement.style.display = 'none';
    }
    if (this.rejectWorkorderButtonSpinner) {
      this.rejectWorkorderButtonSpinner.nativeElement.style.display = 'none';
    }
    if (this.delegateSupervisorButtonSpinner) {
      this.delegateSupervisorButtonSpinner.nativeElement.style.display = 'none';
    }
    if (this.changeTechniciansButtonSpinner) {
      this.changeTechniciansButtonSpinner.nativeElement.style.display = 'none';
    }
    if (this.assignTechniciansButtonSpinner) {
      this.assignTechniciansButtonSpinner.nativeElement.style.display = 'none';
    }
    if (this.acknowledgeWorkorderLoadingButtonSpinner) {
      this.acknowledgeWorkorderLoadingButtonSpinner.nativeElement.style.display = 'none';
    }
    if (this.markWorkorderDoneLoadingButtonSpinner) {
      this.markWorkorderDoneLoadingButtonSpinner.nativeElement.style.display = 'none';
    }
    if (this.updateEngineeringTechniciansButtonSpinner) {
      this.updateEngineeringTechniciansButtonSpinner.nativeElement.style.display = 'none';
    }
    if (this.updateStoresTechniciansButtonSpinner) {
      this.updateStoresTechniciansButtonSpinner.nativeElement.style.display = 'none';
    }
  }

  private closeOpenModal(): void {
    if (this.closeRejectWorkorderModal) {
      this.closeRejectWorkorderModal.nativeElement.click();
    }
    if (this.closeSupervisorHandoverModal) {
      this.closeSupervisorHandoverModal.nativeElement.click();
    }
    if (this.closeChangeTechniciansModal) {
      this.closeChangeTechniciansModal.nativeElement.click();
    }
    if (this.closeAssignTechniciansModal) {
      this.closeAssignTechniciansModal.nativeElement.click();
    }
    if (this.closeEngineeringTechniciansHandoverModal) {
      this.closeEngineeringTechniciansHandoverModal.nativeElement.click();
    }
    if (this.closeStoresTechniciansHandoverModal) {
      this.closeStoresTechniciansHandoverModal.nativeElement.click();
    }
  }

  // format dateTime
  private formatDate(dateTime: string): string {
    return dayjs(dateTime).format('DD MMM, YYYY');
  }

  private formatTime(dateTime: string): string {
    return dayjs(dateTime).format('HH:mm:ss');
  }

  private closeWorkorderByType(workorder: IntWorkorder): Promise<boolean> {
    const type = workorder.workorder.type;
    const workorderType = type
      .trim()
      .toLocaleLowerCase()
      .replace(/\s/g, '-');
    return this.router.navigate([`close-workorder/${workorderType}/${this.userUid}/${this.workorderUid}`]);
  }


  // form getters
  get f(): { [key: string]: AbstractControl } {
    return this.form?.controls;
  }

  get sparesUsedArray(): any {
    return this.form?.get('sparesUsedArray') as FormArray;
  }

  get getTotalSparesCost(): string {
    return this.form?.get('totalSparesCost')?.value;
  }

  // public functions
  // toggle sidenavs
  closeLeftSidenav(): boolean {
    return this.showLeftSidenav = false;

  }

  closeRightSidenav(): boolean {
    return this.showRightSidenav = false;

  }

  displayWorkorder(workorderNumber: string): IntWorkorder | undefined {
    this.workorder = this.workorders?.find((workorder: IntWorkorder) => workorder?.workorder.number === workorderNumber);

    if (this.workorder) {
      this.workorderUid = this.workorder.workorder.uid;
      this.createForm(this.workorder);
      if (this.workorderHasActions) {
        this.showLeftSidenav = false;
        this.showRightSidenav = true;
      }
      return this.workorder;
    }
    return;

  }

  // get workorders by type
  filterWorkorders(type: string): IntWorkorder[] | null {
    return this.workorders && type ?
      this.workorders.filter((workorder: IntWorkorder) => workorder.workorder.type === type) ?
        this.workorders.filter((workorder: IntWorkorder) => workorder.workorder.type === type)
        : null
      : null;
  }

  // clear errors when modal is closed
  resetForms(): void {
    const forms: FormGroup[] = [
      this.rejectWorkorderForm,
      this.changeTechniciansForm,
      this.supervisorsHandoverForm,
      this.assignTechniciansForm,
      this.engTechniciansHandoverForm,
      this.storesTechniciansHandoverForm
    ];

    forms.forEach((form: FormGroup) => {
      if (form) {
        form.reset();
        Object.keys(form?.controls).forEach(
          (key: string) => {
            if (key) {
              form.get(key)?.setErrors(null);
            }
          }
        );
      }
    });


  }

  // refresh opened modal
  refreshModals(): void {
    if (this.workorder !== undefined) {
      // this.resetForms();
      this.workorder = this.workorder;

      if (
        !this.electricalTechnicians ||
        !this.mechanicalTechnicians ||
        !this.storeTechnicians ||
        !this.productionSupervisors ||
        !this.engineeringSupervisors
      ) {
        this.getUsers();
      }

      this.createModalForms();

    }
  }

  // errors on workorder actions
  markDoneBeforeAcknowledged(): void {
    this.toast.close();
    this.toast.info(`You cannnot mark the workorder done before you acknowledge it.`, { id: 'mark-done-before-acknowledged' });
  }

  closeBeforeAcknowledgedOrDone(): void {
    this.toast.close();

    this.toast.info(`You cannot close a workorder that has not been acknowledged and marked as done.`, { id: 'close-before-acknowledged-or-done' });
  }

  handoverAfterAcknowledged(): void {
    this.toast.close();

    this.toast.info(`You have already acknowledged this workorder. You cannot pass it on to someone else.`, { duration: 8000, id: 'handover-after-acknowledged' });
  }

  handoverAfterDone(): void {
    this.toast.close();

    this.toast.info(`You have already acknowledged and marked this workorder as done.
     You cannot hand it over.`,
      { id: 'handover-after-done' });
  }

  // workorder actions
  // supervisors
  approve(): void {
    if (this.workorder) {
      this.approveWorkorderLoading = true;

      const now = dayjs().format();
      const workorderUid = this.workorder.workorder.uid;
      const workorderNumber = this.workorder.workorder.number;

      const workorderUpdateData = {
        approved: {
          status: true,
          dateTime: now
        },
        rejected: { status: false, dateTime: now }

      };
      this.workordersService.updateWorkorder(workorderUid, workorderUpdateData)
        .then(() => {
          this.closeButtonSpinners();
          this.refreshWorkorders();
          this.toast.close();

          this.toast.success(`Success. Workorder ${workorderNumber} approved successfully.`, { id: 'approve-workorder-success' });

        })
        .catch((err: any) => {
          this.closeButtonSpinners();

          console.log('ERR IN APPPROVE WORKORDER ', err);
          this.toast.close();
          this.toast.error(`Failed:
             Approving workorder ${workorderNumber} failed with error WL-04. Please try again, or report the error code to support if the issue persists.`,
            { duration: 8000, id: 'error-code-WL-04' });
        });
    }
  }

  reject(): void {
    const { reason
    } = this.rejectWorkorderForm?.value;

    if (reason === '') {
      return this.rejectWorkorderForm?.get('reason')?.setErrors({
        required: true
      });
    }
    else if (this.rejectWorkorderForm.invalid) {
      this.toast.close();
      this.toast.error(`Error: Ensure the reason for rejecting the workorder is not blank or invalid`, {
        id: 'reject-error'
      });

    } else {
      if (this.workorder) {

        this.rejectWorkorderLoading = true;


        const workorderUid = this.workorder.workorder.uid;
        const workorderNumber = this.workorder.workorder.number;
        const now = dayjs().format();

        const workorderUpdateData = {
          approved: {
            status: false,
            dateTime: now
          },
          rejected: {
            status: true,
            dateTime: now,
            reason
          }

        };

        this.workordersService.updateWorkorder(workorderUid, workorderUpdateData)
          .then(() => {
            this.closeOpenModal();
            this.closeButtonSpinners();

            this.refreshWorkorders();
            this.toast.success(`Success.
             Workorder ${workorderNumber} rejected successfully.`, { id: 'reject-success' });

          })
          .catch((err: any) => {
            this.closeButtonSpinners();

            console.log('ERR IN REJECT WORKORDER ', err);
            this.toast.error(`Failed:
             Rejecting workorder ${workorderNumber} failed with error code WL-05.
              Please try again, or report the error code to support for assistance if the issue persists.`, { duration: 8000, id: 'error-code-WL-05' });
          });

      }

    }
  }

  supervisorsHandover(): void {
    const { newSupervisor
    } = this.supervisorsHandoverForm?.value;
    if (newSupervisor === '') {
      return this.supervisorsHandoverForm?.get('newSupervisor')?.setErrors({ required: true });
    }
    else if (!this.supervisorsHandoverForm.valid) {
      this.toast.close();

      this.toast.error(`Error. Ensure a new supervisor has been selected.`, { id: 'supervisor-handover-error' });
    } else {
      if (this.workorder) {
        this.supervisorHandoverLoading = true;

        const workorderNumber = this.workorder.workorder.number;
        const workorderUid = this.workorder.workorder.uid;
        const workorderUpdateData = {
          supervisor: newSupervisor
        };

        this.workordersService.updateWorkorder
          (workorderUid,
            workorderUpdateData)
          .then(() => {
            this.closeButtonSpinners();
            this.closeOpenModal();

            this.refreshWorkorders();
            this.toast.success(`Success.
             Workorder ${workorderNumber} delegated successfully.`, { id: 'supervisor-handover-success' });
          })
          .catch((err: any) => {
            this.closeButtonSpinners();

            console.log('ERR IN DELEGATE WORKORDER ', err);

            this.toast.error(`Failed:
             Delegating workorder ${workorderNumber} failed with error code WL-06. Please try again or report this error code to support for assistance if the issue persists.`,
              { duration: 8000, id: 'error-code-WL-06' });
          });
      }
    }

  }

  changeTechnicians(): void {
    const {
      newEngTechnician,
      newStoreTechnician
    } = this.changeTechniciansForm?.value;

    if (newEngTechnician === ''
    ) {

      return this.changeTechniciansForm?.get('newEngTechnician')?.setErrors({ required: true });
    }
    else if (newStoreTechnician === '') {
      return this.changeTechniciansForm?.get('newStoreTechnician')?.setErrors({ required: true });
    }
    else if (!this.changeTechniciansForm?.valid) {
      this.toast.close();

      this.toast.error(`Error: Ensure new technicians have been selected, or click cancel to abort changing technicians. Note: you can pick the sexisting technician if you do not want to change him.`,
        { duration: 8000, id: 'change-technicians-error' });
    } else {
      if (this.workorder) {
        this.changeTechniciansLoading = true;
        const workorderNumber = this.workorder.workorder.number;
        const workorderUid = this.workorder.workorder.uid;

        const { technician, storesTechnician } = this.workorder;

        const now = dayjs().format();

        const workorderUpdateData = {
          approved: { status: true, dateTime: now },
          rejected: { status: false, dateTime: now },
          technician: newEngTechnician.fullName ? newEngTechnician : technician,
          storesTechnician: newStoreTechnician.fullName ? newStoreTechnician : storesTechnician,
        };

        this.workordersService.updateWorkorder(workorderUid, workorderUpdateData)
          .then(() => {
            this.closeButtonSpinners();
            this.closeOpenModal();

            this.refreshWorkorders();
            this.toast.success(`Success. Technicians on workorder ${workorderNumber} changed successfully.`);
          })
          .catch((err: any) => {
            this.closeButtonSpinners();

            console.log('ERR IN CHANGE TECHS WORKORDER ', err);
            this.toast.error(`Failed:
              Changing technicians on workorder ${workorderNumber} failed with error code WL-07. Please try again or report this error code to support for assistance if the issue persists.`,
              { duration: 8000, id: 'error-code-WL-07' });

          });
      }
    }
  }

  assignTechnicians(): void {
    const {
      engTechnician,
      storeTechnician
    } = this.assignTechniciansForm?.value;

    if (engTechnician === '') {
      return this.assignTechniciansForm?.get('engTechnician')?.setErrors({ required: true });
    }

    else if (storeTechnician === '') {
      return this.assignTechniciansForm?.get('storeTechnician')?.setErrors({ required: true });
    }

    else if (!this.assignTechniciansForm?.valid) {
      this.toast.close();

      this.toast.error(`Error: Ensure engineering and store technicians have been selected.`,
        { duration: 5000, id: 'assign-technicians-error' });
    } else {
      if (this.workorder) {
        this.assignTechniciansLoading = true;
        const now = dayjs().format();
        const workorderUid = this.workorder.workorder.uid;
        const workorderNumber = this.workorder.workorder.number;

        const workorderUpdateData = {
          approved: { status: true, dateTime: now },
          rejected: { status: false, dateTime: now },
          technician: engTechnician,
          storesTechnician: storeTechnician
        };

        this.workordersService.updateWorkorder(workorderUid, workorderUpdateData)
          .then(() => {
            this.closeButtonSpinners();
            this.closeOpenModal();

            this.refreshWorkorders();

            this.toast.success(`Success. Technicians assigned to workorder ${workorderNumber} successfully.`, { id: 'assign-technicians-success' });
          })
          .catch((err: any) => {
            this.closeButtonSpinners();

            console.log('ERR IN ASSIGN TECHS WORKORDER ', err);

            this.toast.error(`Failed:
              Assigning technicians to workorder ${workorderNumber} failed with error code WL-08. Please try again or report this error code to support for assistance if the issue persists.`,
              { duration: 8000, id: 'error-code-WL-08' });
          });

      }
    }
  }

  // technicians
  acknowledge(): void {
    if (this.workorder) {
      this.acknowledgeWorkorderLoading = true;
      const workorderUid = this.workorder.workorder.uid;
      const workorderNumber = this.workorder.workorder.number;
      const now = dayjs().format();

      const workorderUpdateData = {
        acknowledged: {
          status: true,
          dateTime: now
        }
      };

      this.workordersService.updateWorkorder(workorderUid, workorderUpdateData)
        .then(() => {
          this.closeButtonSpinners();
          this.refreshWorkorders();
          this.toast.success(`Success. Workorder ${workorderNumber} acknowledged successfully.`, { id: 'acknowledge-workorder-success' });

        })
        .catch((err: any) => {
          this.closeButtonSpinners();
          this.toast.error(`Failed. Acknowleding workorder ${workorderNumber} failed with error code WL-09. Please try again or report this error code to support for assistance if the issue persists.`, {
            duration: 8000, id: 'error-code-WL-09'
          });
          console.log('Error code WL-09', err);
        });

    }
  }

  markDone(): void {
    if (this.workorder) {
      this.markWorkorderDoneLoading = true;
      const workorderNumber = this.workorder.workorder.number;
      const workorderUid = this.workorder.workorder.uid;

      const now = dayjs().format();
      const datetimeRaised = dayjs(this.workorder.raised.dateTime);
      const dateTimeApproved = dayjs(this.workorder.approved.dateTime);
      const dateTimeAcknowledged = dayjs(this.workorder.acknowledged.dateTime);

      // getting time differences
      const fromTimeRaised = Math.round(dayjs(now).diff(datetimeRaised, 'minutes', true));
      const fromTimeApproved = Math.round(dayjs(now).diff(dateTimeApproved, 'minutes', true));
      const fromTimeAcknowledged = Math.round(dayjs(now).diff(dateTimeAcknowledged, 'minutes', true));
      const fromTimeMachineStopped = this.workorder.breakdown.status ? Math.round(dayjs(now).diff(dayjs(this.workorder.breakdown.dateTime), 'minutes', true)) : '';

      const workorderUpdateData = {
        done: {
          status: true,
          dateTime: now
        },
        timeTaken: {
          fromTimeMachineStopped,
          fromTimeRaised,
          fromTimeApproved,
          fromTimeAcknowledged
        }
      };
      this.workordersService.updateWorkorder(workorderUid, workorderUpdateData)
        .then(() => {
          this.closeButtonSpinners();
          this.refreshWorkorders();
          this.toast.success(`Success. Workorder ${workorderNumber} marked as done. Click on the workorder to view the time taken.`, { id: 'mark-workorder-done-success' });
        })
        .catch((err: any) => {
          this.closeButtonSpinners();

          this.toast.error(`Failed. Marking workorder ${workorderNumber} as done failed with error code WL-10. Please try again or report this error code to support for assistance if the issue persists.`, {
            duration: 8000, id: 'error-code-WL-10'
          });

          console.log('Error code WL-10', err);
        });
    }
  }

  close(workorder: IntWorkorder): void {
    this.closeWorkorderByType(workorder);
  }


  engTechnicianHandover(): void {
    const { newTechnician
    } = this.engTechniciansHandoverForm?.value;

    if (newTechnician === '') {
      return this.engTechniciansHandoverForm?.get('newTechnician')?.setErrors({ required: true });
    }
    else if (this.engTechniciansHandoverForm.invalid) {
      this.toast.close();

      this.toast.error(`Error: Ensure a new technician has been picked, or click on cancel to abort the handover.`, { id: 'eng-technician-handover-error' });
    } else {
      if (this.workorder) {
        this.engTechnicianHandoverLoading = true;

        const workorderUid = this.workorder.workorder.uid;
        const workorderNumber = this.workorder.workorder.number;
        const workorderUpdateData = {
          technician: newTechnician
        };

        this.workordersService.updateWorkorder(workorderUid, workorderUpdateData)
          .then(() => {
            this.closeButtonSpinners();
            this.closeOpenModal();
            this.refreshWorkorders();
            this.toast.success(`Success. Workorder ${workorderNumber} handed over successfully.`,
              { id: 'eng-technician-handover-success' });
          })
          .catch(() => {
            this.closeButtonSpinners();

            this.toast.error(`Failed. Handing over workorder ${workorderNumber} failed with error code WL-11. Please try again or report this error code to support for assistance if the issue persists.`, {
              duration: 8000, id: 'error-code-WL-11'
            });
          });
      }
    }
  }

  storesTechnicianHandover(): void {
    const { newTechnician
    } = this.storesTechniciansHandoverForm?.value;
    if (newTechnician === '') {
      return this.storesTechniciansHandoverForm?.get('newTechnician')?.setErrors({ required: true });
    }
    else if (this.storesTechniciansHandoverForm.invalid) {
      this.toast.close();

      this.toast.error(`Error: Please ensure a new technician has been picked, or click on cancel to abort the handover.`, { id: 'stores-technician-handover-error' });
    } else {
      if (this.workorder) {
        this.storesTechnicianHandoverLoading = true;

        const workorderUid = this.workorder.workorder.uid;
        const workorderNumber = this.workorder.workorder.number;
        const workorderUpdateData = {
          storesTechnician: newTechnician
        };

        this.workordersService.updateWorkorder(workorderUid, workorderUpdateData)
          .then(() => {
            this.closeButtonSpinners();
            this.closeOpenModal();

            this.refreshWorkorders();

            this.toast.success(`Success. Workorder ${workorderNumber} handed over successfully.`,
              { id: 'stores-technician-handover-success' });
          })
          .catch(() => {
            this.closeButtonSpinners();

            this.toast.error(`Failed. Handing over workorder ${workorderNumber} failed with error code WL-12. Please try again or report this error code to support for assistance if the issue persists.`, {
              duration: 8000, id: 'error-code-WL-12'
            });
          });
      }
    }
  }
}
