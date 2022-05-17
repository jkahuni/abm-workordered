import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';

// rxjs
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// interfaces
import { IntWorkorder, IntSpare, IntSpareWithQuantities } from '@workorders/models/workorders.models';

// services
import { WorkordersService } from '@workorders/services/workorders.service';
import { HotToastService } from '@ngneat/hot-toast';

// dayjs
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-issue-spares',
  templateUrl: './issue-spares.component.html',
  styleUrls: ['./issue-spares.component.scss']
})
export class IssueSparesComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toast: HotToastService,
    private workordersService: WorkordersService,
    private currencyPipe: CurrencyPipe
  ) {
    this.searchSparesSubject
      .pipe(
        debounceTime(600),
        distinctUntilChanged())
      .subscribe((searchTerm: string) =>
        this.getSpares(searchTerm));
  }

  // template references
  @ViewChild('workorderLoadingSpinner') workorderLoadingSpinner!: ElementRef;
  @ViewChild('issuingSparesButtonSpinner') issuingSparesButtonSpinner!: ElementRef;
  // to set focus to search spares input field
  @ViewChild('searchSparesInputField') searchSparesInputField!: ElementRef;

  // for searching spares
  private searchSparesSubject = new Subject<string>();

  form!: FormGroup;

  workorder!: IntWorkorder;

  // for the spares
  spares!: IntSpare[];

  workorderUid!: string | null;

  // for navigating back to list workorders
  userUid!: string | null;
  workordersType!: string | null;

  // controlling the bootstrap spinners
  loadingWorkorder = false;
  issuingSpares = false;
  showErrorMessage = false;


  ngOnInit(): void {
    this.loadingWorkorder = true;
    this.workorderUid = this.route.snapshot.paramMap.get('workorderUid');
    this.userUid = this.route.snapshot.paramMap.get('userUid');
    this.workordersType = this.route.snapshot.paramMap.get('workordersType');

    this.getWorkorder();
  }

  private getWorkorder(): void {
    if (this.workorderUid) {
      this.workordersService.getWorkorder(this.workorderUid)
        .then((workorder: IntWorkorder) => {
          this.workorder = workorder;
          this.form = this.createWorkorderForm(workorder);
          this.hideWorkorderLoadingSpinner();
        })
        .catch((err: any) => {
          this.showErrorMessage = true;
          this.hideWorkorderLoadingSpinner();
          console.log('ERROR IN GETTING WORKORDER ', err);
        });
    }
  }

  private hideWorkorderLoadingSpinner(): void {
    this.loadingWorkorder = false;
    if (this.workorderLoadingSpinner) {
      this.workorderLoadingSpinner.nativeElement.style.display = 'none';
    }
  }

  private createWorkorderForm(workorder: IntWorkorder): FormGroup {
    const form = this.fb.group({
      workorderUid: [workorder.workorder.uid],
      workorderNumber: [workorder.workorder.number],
      workorderType: [workorder.workorder.type],
      amStep: [workorder.abnormalityCard.amStep],
      raiser: [workorder.raiser.fullName],
      dateRaised: [this.formatDate(workorder.raised.dateTime)],
      timeRaised: [this.formatTime(workorder.raised.dateTime)],
      dateMachineStopped: [this.formatDate(workorder.breakdown.dateTime)],
      timeMachineStopped: [this.formatTime(workorder.breakdown.dateTime)],
      dateApproved: [this.formatDate(workorder.approved.dateTime)],
      timeApproved: [this.formatTime(workorder.approved.dateTime)],
      problemDescription: [workorder.workorder.description ? workorder.workorder.description : 'No description provided'],
      section: [workorder.section.name],
      machine: [workorder.machine.name],
      supervisor: [workorder.supervisor.fullName],
      technician: [workorder.technician.fullName],
      storeTechnician: [workorder.storesTechnician.fullName],
      sparesUsedStatus: [workorder.sparesUsed.status ? 'true' : ''],
      sparesUsedArray: this.fb.array(workorder.sparesUsed.status ? [...this.getIssuedSpares(workorder.sparesUsed.spares)] : []),
      searchSparesInput: [''],
      selectSparesUsed: [''],

    });

    this.trackSparesUsedStatusChanges(form);

    return form;
  }

  private formatDate(dateTime: string): string {
    return dayjs(dateTime).format('DD MMM, YYYY');
  }

  private formatTime(dateTime: string): string {
    return dayjs(dateTime).format('HH:mm:ss');
  }

  private getIssuedSpares(spares: IntSpareWithQuantities[]): FormGroup[] {
    const sparesArray: FormGroup[] = [];
    spares.map(
      (spare: IntSpareWithQuantities) => {
        // console.log('SPARE ', spare);
        const form = this.fb.group({
          code: [spare.code],
          quantity: [spare.quantity],
          totalCost: [spare.totalCost],
          unitCost: [spare.unitCost],
          name: [spare.name]
        });
        sparesArray.push(form);

        this.trackSpareQuantityChanges(form);
      }
    );

    return sparesArray;

  }

  // track changes on spare quantity field
  private trackSpareQuantityChanges(form: FormGroup): void {
    form.get('quantity')?.valueChanges.subscribe(
      (newQuantity: string) => {
        const { code, unitCost } = form?.value;
        if (isNaN(+newQuantity)) {
          setTimeout(() => {
            this.form.get('sparesUsedArray')?.setErrors(
              {
                invalidSpares: true,
                invalidSpareQuantity: {
                  errorMessage:
                    `${newQuantity} is not a valid quantity for spare ${code}. Enter a valid number.`
                }
              }
            );
          }, 0);
        } else {
          const totalCost = this.formatCurrency(this.calculateSpareCost(unitCost, newQuantity));
          form.patchValue({
            totalCost
          }, { emitEvent: false });
        }
      }
    );
  }

  private trackSparesUsedStatusChanges(form: FormGroup): void {
    form.get('sparesUsedStatus')?.valueChanges
      .subscribe((sparesUsedStatus: string) => {
        if (sparesUsedStatus === 'true') {
          setTimeout(() => {
            if (this.searchSparesInputField) {
              this.searchSparesInputField.nativeElement.focus({ preventScroll: false });
            }
          });
        } else if (sparesUsedStatus === 'false') {
          this.sparesUsedArray.clear();
        }
      });
  }


  // fn called from searchSparesSubject in the constructor
  // done this way to add debounceTime
  // and distinctUntilChanged
  private getSpares(searchTerm: string): IntSpare[] | any {
    this.workordersService.getSpares(searchTerm)
      .then((spares: IntSpare[]) => {
        this.spares = spares;
      })
      .catch((err: any) => {
        if (err.code === 'failed-precondition') {
          this.toast.close();
          this.toast.error(`Fetching spares failed with error code IS-03. Report this error code to support to have it fixed.`, { duration: 20000 });

        } else {
          this.toast.error(`Error code IS-02: An error occured while fetching spares. Please try again.`, { duration: 5000 });
          console.log('Error code IS-02: ', err.code);
        }
      });
  }

  private navigateToListWorkorders(): void {
    this.router.navigate([`/workorders/stores/${this.workordersType
      }/${this.userUid}`]);
  }

  private hideIssuingSparesSpinner(): void {
    this.issuingSpares = false;
    if (this.issuingSparesButtonSpinner) {
      this.issuingSparesButtonSpinner.nativeElement.style.display = 'none';
    }

  }

  // sets the total cost of each spare item
  private calculateSpareCost(spareUnitCost: string, quantity: string): string {

    const integerUnitCost = parseFloat(spareUnitCost.replace(/,/g, ''));
    const integerQuantity = +quantity;
    const totalCost = integerUnitCost *
      integerQuantity;

    return totalCost.toString();
  }

  private formatCostAsInteger(cost: any): number {
    if (cost) {
      if (isNaN(+cost)) {
        const costString = cost.toString().replace(/[KSh\s,]+/g, '');
        return +costString;
      } else {
        return +cost;
      }
    }
    return 0;
  }

  private calculateAllSparesTotalCost(): number {
    return this.sparesUsedArray.controls.map((spareForm: FormGroup) => spareForm.get('totalCost')?.value)
      .reduce((totalSparesCost: any, totalSpareCost: any): number => this.formatCostAsInteger(totalSparesCost)
        +
        this.formatCostAsInteger(totalSpareCost)
        , 0);
  }

  private formatCurrency(cost: string | number): string | null {
    if (cost || cost === 0) {
      const costToTransform = this.formatCostAsInteger(cost);
      const tranformedCost = this.currencyPipe.transform(costToTransform, 'KES', 'KSh ');
      return tranformedCost;
    } else {
      return cost.toString();
    }
  }

  // form getters
  get sparesUsedStatus(): boolean {
    const sparesUsedStatus = this.form?.get('sparesUsedStatus')?.value;
    return sparesUsedStatus === 'true' ? true : false;
  }

  get sparesUsedArray(): any {
    return this.form.get(`sparesUsedArray`) as FormArray;
  }

  get getTotalSparesCost(): string | null {
    return this.formatCurrency(this.calculateAllSparesTotalCost());
  }

  // fn called from search input field keyup event
  searchSpares(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement)
      .value.trim().toLocaleLowerCase();

    return this.searchSparesSubject.next(searchTerm);

  }

  addNewSpare(event: any, spare: IntSpare): any {
    if (event.isUserInput) {
      // check if the spare already exists in the array
      const spareExists = this.sparesUsedArray.controls.map((sparesForm: FormGroup) => sparesForm.get('code')?.value)
        .find((spareItemCode: string) =>
          spareItemCode === spare.code
        );

      // add the spare
      if (spareExists === undefined) {
        const { code, unitCost, name } = spare;
        const quantity = 1;
        const totalCost = this.formatCurrency(this.calculateSpareCost(unitCost, quantity.toString()));

        const selectedSparesFormObject = this.fb.group({
          code,
          quantity,
          totalCost,
          unitCost,
          name

        });

        this.sparesUsedArray.push(selectedSparesFormObject);

        // listen to changes
        this.trackSpareQuantityChanges(selectedSparesFormObject);

      }
    }
  }

  removeAddedSpare(spareIndex: number): any {
    return this.sparesUsedArray.removeAt(spareIndex);
  }


  returnToListWorkorders(): void {
    this.navigateToListWorkorders();

  }

  issueSpares(): void {
    const { sparesUsedStatus, sparesUsedArray, workorderUid, workorderNumber } = this.form?.value;

    if (sparesUsedStatus === '') {
      this.form?.get('sparesUsedStatus')?.setErrors({
        statusUnknown: true
      });
    }

    else if (sparesUsedStatus === 'true' &&
      sparesUsedArray.length === 0) {
      this.form.get('sparesUsedArray')?.setErrors(
        {
          invalidSpares: true,
          invalidLength: {
            errorMessage: `Spares are indicated to have been used, but it appears
                  you did not select any spares. Please select spares, or click
                  No Spares Used, or click Cancel below to exit.`}
        }
      );

      this.form.get('selectSparesUsed')?.setErrors({
        noSparesSelected: {
          errorMessage: `Please select spares.`
        }
      })
    }

    else if (!this.form?.valid) {
      this.toast.error(`Error code IS-03: The form appears to be invalid. This might because you have not indicated whether or not spares were used, or you have not selected any spares, or any edited spare quantities are not valid.`, { duration: 9000 });

    }

    else {
      this.issuingSpares = true;

      const totalSparesCost = this.formatCurrency(this.calculateAllSparesTotalCost());
      const totalSpares = sparesUsedArray.length;

      const workorderUpdateData = {
        sparesUsed: {
          status: sparesUsedStatus === 'true' ? true : false,
          spares: sparesUsedArray,
          totalCost: totalSparesCost
        }

      };

      this.workordersService.updateWorkorder(workorderUid, workorderUpdateData)
        .then(() => {
          this.navigateToListWorkorders();
          this.hideIssuingSparesSpinner();
          this.workordersService.refreshWorkorders(workorderUid, workorderUpdateData);
          this.toast.success(`Success. ${totalSpares
            } spare(s) added succesfuly to workorder ${workorderNumber}.`);

        })
        .catch((err: any) => {
          this.toast.error(`Error code IS-04: An error occured while updating the spares on workorder ${workorderNumber}.
              Please try again.`);
          this.hideIssuingSparesSpinner();
          console.log('error IS-04= ', err);

        });
    }


  }
}
