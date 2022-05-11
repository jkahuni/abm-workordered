import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormArray } from '@angular/forms';
import { MatSelect } from '@angular/material/select';

// firestore imports
import {
  Query, DocumentData,
  query, orderBy, where,
  Firestore, collection,
  CollectionReference,
  limit
} from '@angular/fire/firestore';

// services
import { WorkordersService } from '@workorders/services/workorders.service';
import { HotToastService } from '@ngneat/hot-toast';

// interfaces
import { IntUser, IntWorkorder, IntSpareWithQuantities } from '@workorders/models/workorders.models';

// dayjs
import * as dayjs from 'dayjs';
import * as weekOfYear from 'dayjs/plugin/weekOfYear';
import * as isToday from 'dayjs/plugin/isToday';
import * as isYesterday from 'dayjs/plugin/isYesterday';

dayjs.extend(weekOfYear);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

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
  @ViewChild('reviewWorkorderButtonSpinner') reviewWorkorderButtonSpinner!: ElementRef;
  @ViewChild('reviewWorkordersButtonSpinner') reviewWorkordersButtonSpinner!: ElementRef;
  @ViewChild('raiseConcernButtonSpinner') raiseConcernButtonSpinner!: ElementRef;

  // close modals (X on the modal)
  @ViewChild('closeRejectWorkorderModal') closeRejectWorkorderModal!: ElementRef;
  @ViewChild('closeSupervisorHandoverModal') closeSupervisorHandoverModal!: ElementRef;
  @ViewChild('closeChangeTechniciansModal') closeChangeTechniciansModal!: ElementRef;
  @ViewChild('closeAssignTechniciansModal') closeAssignTechniciansModal!: ElementRef;
  @ViewChild('closeEngineeringTechniciansHandoverModal') closeEngineeringTechniciansHandoverModal!: ElementRef;
  @ViewChild('closeStoresTechniciansHandoverModal') closeStoresTechniciansHandoverModal!: ElementRef;
  @ViewChild('closeReviewWorkordersModal') closeReviewWorkordersModal!: ElementRef;
  @ViewChild('closeRaiseConcernModal') closeRaiseConcernModal!: ElementRef;

  // filter workorders options
  @ViewChild('filterWorkordersOptionsField') filterWorkordersOptionsField!: MatSelect;


  // route params
  userType!: string | null;
  workordersType!: string | null;
  userUid!: string | null;

  workorders!: IntWorkorder[];
  workordersToDisplay!: IntWorkorder[];
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
  reviewWorkordersForm!: FormGroup;
  raiseConcernForm!: FormGroup;

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

  // for filtering workorders
  showWorkordersFilterOptions = false;

  // loading spinners
  loadingWorkorders = true;
  loadingWorkordersFailed = false;
  loadingWorkordersIndexingError!: string;
  loadingWorkordersOtherError!: string;
  loadingWorkordersDefaultError: string = `
  Loading workorders failed with error code ULW-01. Try reloading the page or report the error code to support to have it fixed.`;


  // toggle button spinner conditions
  approveWorkorderLoading = false;
  rejectWorkorderLoading = false;
  supervisorHandoverLoading = false;
  changeTechniciansLoading = false;
  assignTechniciansLoading = false;
  acknowledgeWorkorderLoading = false;
  markWorkorderDoneLoading = false;
  engTechnicianHandoverLoading = false;
  storesTechnicianHandoverLoading = false;
  reviewingWorkorder = false;
  reviewingWorkorders = false;
  raisingConcern = false;


  // for showing the filter option
  filterOption!: string;

  // to select users to send concerns to
  usersToSendConcernsTo: IntUser[] = [];


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
      // manager
      if (this.userType === 'manager') {
        if (this.workordersType === 'reviewed') {
          const first100WorkordersQuery = query(
            workordersColRef,
            orderBy('workorder.number'),
            where('review.status', '==', 'reviewed'),
            limit(100)
          );
          this.workorderHasActions = false;
          return first100WorkordersQuery;
        }
        else if (this.workordersType === 'un-reviewed') {
          const first100WorkordersQuery = query(
            workordersColRef,
            orderBy('workorder.number'),
            where('review.status', '==', ''),
            limit(100)
          );
          this.workorderHasActions = true;
          return first100WorkordersQuery;
        }
      }

      // supervisor
      else if (this.userType === 'supervisor') {
        // unverified workorders
        if (this.workordersType === 'unverified') {
          const unverifiedWorkordersQuery = query(
            workordersColRef,
            orderBy('workorder.number'),
            where('approved.status', '==', false),
            where('rejected.status', '==', false),
            where('supervisor.uid', '==', this.userUid),
            limit(100)
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
            where('supervisor.uid', '==', this.userUid),
            limit(100));

          return approvedWorkordersQuery;

        }

        // rejected workorders
        else if (this.workordersType === 'rejected') {
          const rejectedWorkordersQuery = query(
            workordersColRef,
            orderBy('workorder.number'),
            where('approved.status', '==', false),
            where('rejected.status', '==', true),
            where('supervisor.uid', '==', this.userUid),
            limit(100)
          );

          return rejectedWorkordersQuery;

        }

        // raised workorders
        else if (this.workordersType === 'raised') {
          const raisedWorkordersQuery = query(
            workordersColRef,
            orderBy('workorder.number'),
            where('raiser.uid', '==', this.userUid),
            limit(100)
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
            where('technician.uid', '==', this.userUid),
            limit(100)
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
            where('technician.uid', '==', this.userUid),
            limit(100)
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
            where('storesTechnician.uid', '==', this.userUid),
            limit(100)
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
            where('storesTechnician.uid', '==', this.userUid),
            limit(100)
          );
          this.workorderHasActions = true;
          return storesOpenWorkordersQuery;
        }

      }
      // other types of users
      // (operator, offices, distribution)
      else if (this.userType === 'other') {
        if (this.workordersType === 'raised') {
          const raisedWorkordersQuery = query(
            workordersColRef,
            orderBy('workorder.number'),
            where('raiser.uid', '==', this.userUid),
            limit(100)
          );

          return raisedWorkordersQuery;
        }

        else if (this.workordersType === 'approved') {
          const approvedWorkordersQuery = query(
            workordersColRef,
            orderBy('workorder.number'),
            where('approved.status', '==', true),
            where('rejected.status', '==', false),
            where('raiser.uid', '==', this.userUid),
            limit(100)
          );


          return approvedWorkordersQuery;
        }

        else if (this.workordersType === 'rejected') {
          const rejectedWorkordersQuery = query(
            workordersColRef,
            orderBy('workorder.number'),
            where('approved.status', '==', false),
            where('rejected.status', '==', true),
            where('raiser.uid', '==', this.userUid),
            limit(100)
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
          this.workordersToDisplay = this.workorders;
          this.hideLoadingWorkordersSpinner();

        })
        .catch((err: any) => {
          this.hideLoadingWorkordersSpinnerOnError();
          if (err.code === 'failed-precondition') {
            this.loadingWorkordersIndexingError = `Loading workorders failed with error code IND-LW-01. Please report this error code to support to have it fixed.`;
            console.log('ERROR IND-LW-01', err);
          }

          else {
            this.loadingWorkordersOtherError = `Loading workorders failed with error code LW-01. Please try reloading the page or report this error code to support to have it fixed.`;
            console.log('ERROR LW-01', err);
          }
        });
    }

    else {
      this.hideLoadingWorkordersSpinnerOnError();

      this.loadingWorkordersOtherError = `Loading workorders failed with error code LW-02. Please try reloading the page or report this error code to support to have it fixed.`;
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

    this.reviewWorkordersForm = this.createReviewWorkordersForm();
    this.raiseConcernForm = this.createRaiseConcernForm();

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
      .catch(() => {
        this.toast.close();
        this.toast.error(`Error: A crucial operation failed with error code LW-GU-01. Please reload the page or report the error code to support to have it fixed.`,
          { autoClose: false, id: 'error-code-WL-03' });
      });
  }

  // hide spinners
  private hideLoadingWorkordersSpinner(): void {
    this.loadingWorkorders = false;
    if (this.loadingWorkordersSpinner) {
      this.loadingWorkordersSpinner.nativeElement.style.display = 'none';
    }
  }

  private hideLoadingWorkordersSpinnerOnError(): void {
    this.loadingWorkordersFailed = true;
    this.hideLoadingWorkordersSpinner();

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

  private createReviewWorkordersForm(): FormGroup {
    const form = this.fb.group({
      dateRaisedFilter: ['']
    });

    return form;
  }

  private createRaiseConcernForm(): FormGroup {
    const form = this.fb.group({
      user: ['', Validators.required],
      concern: ['', Validators.required]
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
    this.reviewingWorkorder = false;
    this.reviewingWorkorders = false;
    this.raisingConcern = false;

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

    if (this.reviewWorkorderButtonSpinner) {
      this.reviewWorkorderButtonSpinner.nativeElement.style.display = 'none';
    }
    if (this.reviewWorkordersButtonSpinner) {
      this.reviewWorkordersButtonSpinner.nativeElement.style.display = 'none';
    }
    if (this.raiseConcernButtonSpinner)
      this.raiseConcernButtonSpinner.nativeElement.style.display = 'none'; { }
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
    if (this.closeReviewWorkordersModal) {
      this.closeReviewWorkordersModal.nativeElement.click();
    }
    if (this.closeRaiseConcernModal) {
      this.closeRaiseConcernModal.nativeElement.click();
    }
  }

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

  // filter workorder fns
  private filterTodaysWorkorders(date: string): boolean {
    const dateRaised = dayjs(date);
    return dateRaised && dateRaised.isToday() ? true : false;
  }

  private filterYesterdaysWorkorders(date: string): boolean {
    const dateRaised = dayjs(date);

    return dateRaised && dateRaised.isYesterday() ? true : false;
  }

  private filterThisWeeksWorkorders(date: string): boolean {
    const now = dayjs();
    const dateRaised = dayjs(date);
    const yearsDifference = dateRaised.year() - now.year();
    const monthsDifference = dateRaised.month() - now.month();
    const weeksDifference = dateRaised.week() - now.week();

    return yearsDifference === 0 && monthsDifference === 0 && weeksDifference === 0 ? true : false;

  }

  private filterLastWeeksWorkorders(date: string): boolean {
    const now = dayjs();
    const dateRaised = dayjs(date);

    const yearsDifference = dateRaised.year() - now.year();
    const monthsDifference = dateRaised.month() - now.month();
    const weeksDifference = dateRaised.week() - now.week();

    return yearsDifference === 0 && monthsDifference === 0 && weeksDifference === -1 ? true : false;
  }

  private filterThisMonthsWorkorders(date: string): boolean {
    const now = dayjs();
    const dateRaised = dayjs(date);

    const yearsDifference = dateRaised.year() - now.year();
    const monthsDifference = dateRaised.month() - now.month();

    return yearsDifference === 0 && monthsDifference === 0 ? true : false;
  }

  private filterLastMonthsWorkorders(date: string): boolean {
    const now = dayjs();
    const dateRaised = dayjs(date);

    const yearsDifference = dateRaised.year() - now.year();
    const monthsDifference = dateRaised.month() - now.month();

    return yearsDifference === 0 && monthsDifference === -1 ? true : false;
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
  createWorkordersHeader(): string {
    return this.workordersType?.replace(/-/g, '') + ' workorders';
  }

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
      this.usersToSendConcernsTo.push(this.workorder.raiser,
        this.workorder.technician,
        this.workorder.storesTechnician,
        this.workorder.supervisor);
      this.createForm(this.workorder);
      if (this.workorderHasActions) {
        this.showLeftSidenav = false;
        this.showRightSidenav = true;
      }
      return this.workorder;
    }
    return;

  }

  filterWorkordersByDateRaised(filterOption: string): IntWorkorder[] {
    if (filterOption) {
      this.filterOption = filterOption;
      this.workordersToDisplay = this.workorders
        .filter((workorder: IntWorkorder) => {
          const date = workorder.raised.dateTime;
          if (filterOption === 'Today') {
            return this.filterTodaysWorkorders(date) ? workorder : null;
          } else if (filterOption === 'Yesterday') {
            return this.filterYesterdaysWorkorders(date);
          }
          else if (filterOption === 'This Week') {
            return this.filterThisWeeksWorkorders(date);
          }
          else if (filterOption === 'Last Week') {
            return this.filterLastWeeksWorkorders(date);
          }
          else if (filterOption === 'This Month') {
            return this.filterThisMonthsWorkorders(date);
          }
          else if (filterOption === 'Last Month') {
            return this.filterLastMonthsWorkorders(date);
          }
          else if (filterOption === 'None') {
            return true;
          }
          else {
            this.workordersToDisplay = this.workorders;
            return this.workordersToDisplay;
          }
        });
      this.workorder = undefined;
      this.showWorkordersFilterOptions = false;
      return this.workordersToDisplay;
    } else {
      this.workorder = undefined;
      this.showWorkordersFilterOptions = false;
      return this.workordersToDisplay;
    }


  }

  filterWorkordersByType(type: string): IntWorkorder[] | null {
    return type && this.workordersToDisplay ?
      this.workordersToDisplay.filter((workorder: IntWorkorder) => workorder.workorder.type === type) ?
        this.workordersToDisplay.filter((workorder: IntWorkorder) => workorder.workorder.type === type)
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
      this.storesTechniciansHandoverForm,
      this.reviewWorkordersForm,
      this.raiseConcernForm
    ];

    forms.forEach((form: FormGroup) => {
      if (form) {
        console.log('form accessed initial');
        form.reset();
        Object.keys(form?.controls).forEach(
          (key: string) => {
            if (key) {
              console.log('form accessed final');

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
    const {
      reason
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
          .catch(() => {
            this.closeButtonSpinners();
            this.toast.error(`Failed:
             Rejecting workorder ${workorderNumber} failed with error code LW-RW-01.
              Please try again, or report the error code to support for assistance if the issue persists.`, { autoClose: false, id: 'error-code-WL-05' });
          });

      }

    }
  }

  supervisorsHandover(): void {
    const {
      newSupervisor
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
          .catch(() => {
            this.closeButtonSpinners();

            this.toast.error(`Failed:
             Delegating workorder ${workorderNumber} failed with error code LW-SH-01. Please try again or report this error code to support for assistance if the issue persists.`,
              { autoClose: false, id: 'error-code-WL-06' });
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
          .catch(() => {
            this.closeButtonSpinners();
            this.toast.error(`Failed:
              Changing technicians on workorder ${workorderNumber} failed with error code LW-CT-01. Please try again or report this error code to support for assistance if the issue persists.`,
              { autoClose: false, id: 'error-code-WL-07' });

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
          .catch(() => {
            this.closeButtonSpinners();
            this.toast.error(`Failed:
              Assigning technicians to workorder ${workorderNumber} failed with error code LW-AT-01. Please try again or report this error code to support for assistance if the issue persists.`,
              { autoClose: false, id: 'error-code-WL-08' });
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
        .catch(() => {
          this.closeButtonSpinners();
          this.toast.error(`Failed. Acknowleding workorder ${workorderNumber} failed with error code LW-AW-01. Please try again or report this error code to support for assistance if the issue persists.`, {
            autoClose: false, id: 'error-code-WL-09'
          });
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
        .catch(() => {
          this.closeButtonSpinners();
          this.toast.error(`Failed. Marking workorder ${workorderNumber} as done failed with error code LW-MWD-01. Please try again or report this error code to support for assistance if the issue persists.`, {
            autoClose: false, id: 'error-code-WL-10'
          });
        });
    }
  }

  close(workorder: IntWorkorder): void {
    this.closeWorkorderByType(workorder);
  }

  engTechnicianHandover(): void {
    const {
      newTechnician
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

            this.toast.error(`Failed. Handing over workorder ${workorderNumber} failed with error code LW-ETH-01. Please try again or report this error code to support for assistance if the issue persists.`, {
              autoClose: false, id: 'error-code-WL-11'
            });
          });
      }
    }
  }

  storesTechnicianHandover(): void {
    const {
      newTechnician
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

            this.toast.error(`Failed. Handing over workorder ${workorderNumber} failed with error code LW-STH-01. Please try again or report this error code to support for assistance if the issue persists.`, {
              autoClose: false, id: 'error-code-WL-12'
            });
          });
      }
    }
  }

  // ENG MANAGER ACTIONS
  reviewWorkorder(): void {
    if (this.workorder) {
      this.reviewingWorkorder = true;
      const now = dayjs().format();
      const workorderUid = this.workorder.workorder.uid;
      const workorderNumber = this.workorder.workorder.number;
      const workorderUpdateData = {
        review: {
          status: 'reviewed',
          concerns: [],
          dateTime: now

        }
      };

      this.workordersService.updateWorkorder(workorderUid, workorderUpdateData)
        .then(() => {
          this.closeButtonSpinners();
          this.refreshWorkorders();
          this.toast.success(`Success. Workorder ${workorderNumber} reviewed successfully.`, { id: 'review-workorder-success' });
        })
        .catch(() => {
          this.closeButtonSpinners();
          this.toast.error(`Failed. Reviewing workorder ${workorderNumber} failed with error code LW-RSW-01. Please try again or report the error code to support to have the issue fixed.`, { autoClose: false, id: 'review-workorder-error' });

        });
    }
  }

  reviewWorkorders(): void {
    const { dateRaisedFilter } = this.reviewWorkordersForm?.value;

    if (dateRaisedFilter === '') {
      return this.reviewWorkordersForm?.get('dateRaisedFilter')?.setErrors({
        required: true
      });
    }

    else if (this.reviewWorkordersForm?.invalid) {
      this.toast.close();
      this.toast.error(`An error occured while submitting your form. Please try again.`, { id: 'review-wokrorders-error-1' });
    }

    else {
      this.reviewingWorkorders = true;

      const workordersToReview = this.workorders.filter(
        (workorder: IntWorkorder) => {
          const reviewStatus = workorder.review.status;
          const date = workorder.raised.dateTime;
          if (reviewStatus === '') {
            if (dateRaisedFilter === 'all') {
              return true;
            }
            else if (dateRaisedFilter === 'today') {
              return this.filterTodaysWorkorders(date);
            }
            else if (dateRaisedFilter === 'yesterday') {
              return this.filterYesterdaysWorkorders(date);
            }
            else if (dateRaisedFilter === 'this-week') {
              return this.filterThisWeeksWorkorders(date);
            }
            else if (dateRaisedFilter === 'last-week') {
              return this.filterLastWeeksWorkorders(date);
            }
            else if (dateRaisedFilter === 'this-month') {
              return this.filterThisMonthsWorkorders(date);
            }
            else if (dateRaisedFilter === 'last-month') {
              return this.filterLastMonthsWorkorders(date);
            }
          }
          return false;
        }
      );

      const totalWorkordersToReview = workordersToReview.length;

      workordersToReview.forEach(
        (workorder: IntWorkorder, index) => {
          const workorderUid = workorder.workorder.uid;
          const now = dayjs().format();

          const workorderUpdateData = {
            review: {
              status: 'reviewed',
              dateTime: now,
              concern: {}
            }
          };

          this.workordersService.updateWorkorder(workorderUid, workorderUpdateData)
            .then(() => {
              if (index + 1 === totalWorkordersToReview) {
                this.closeButtonSpinners();
                this.closeOpenModal();
                this.refreshWorkorders();
                this.toast.success(`Success. ${totalWorkordersToReview} workorder(s) reviewed successfully.`,
                  { duration: 8000, id: 'review-workorders-success' });
              }
            })
            .catch(() => {
              this.closeButtonSpinners();
              this.toast.error(
                `Error: Reviewing multiple workorders failed with error code LW-RMW-01. 
              Please report this error code to support to have the error fixed.`,
                { autoClose: false, id: 'review-workorders-error-2' });
            });

        }
      );
    }
  }

  raiseConcern(): void {
    const { user, concern } = this.raiseConcernForm?.value;

    if (user === '') {
      this.raiseConcernForm?.get('user')?.setErrors({
        required: true
      });
    }

    else if (concern === '') {
      this.raiseConcernForm?.get('concern')?.setErrors({
        required: true
      });
    }

    else if (this.raiseConcernForm?.invalid) {
      this.toast.error(`Error: Ensure user and concern fields are not blank or invalid.`, { duration: 5000, id: 'raise-concern-invalid-form' });
    }

    else {
      if (this.workorder) {

        this.raisingConcern = true;

        const workorderUid = this.workorder.workorder.uid;
        const workorderNumber = this.workorder.workorder.number;

        const workorderUpdateData = {
          review: {
            status: 'reviewed',
            dateTime: dayjs().format(),
            concern: {
              user,
              message: concern
            }
          }
        };

        this.workordersService.updateWorkorder(workorderUid, workorderUpdateData)
          .then(() => {
            this.closeButtonSpinners();
            this.closeOpenModal();
            this.refreshWorkorders();
            this.toast.success(`Success. Concern on workorder ${workorderNumber
              } raised successfully.`, { duration: 6000, id: 'raise-concern-success' });


          })
          .catch(() => {
            this.closeButtonSpinners();
            this.toast.error(`Failed. Raising concern on workorder ${workorderNumber
              } failed with error code LW-RC-01. Please try again or report ths error code to support for assistance.`, { id: 'raise-concern-error-2', autoClose: false });
          });
      }
    }
  }
}
