import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { IntUser, IntWorkorder } from '@workorders/models/workorders.models';
import { WorkordersService } from '@workorders/services/workorders.service';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-change-technicians-modal',
  templateUrl: './change-technicians-modal.component.html',
  styleUrls: ['./change-technicians-modal.component.scss']
})
export class ChangeTechniciansModalComponent implements OnInit, OnChanges {

  constructor(
    private workordersService: WorkordersService,
    private toast: HotToastService,
    private fb: FormBuilder

  ) {
    setTimeout(() => {
      if (this.openModalButton) {
        this.openModalButton.nativeElement.click();
      }
    });
  }

  @Input('workorder')
  selectedWorkorder!: IntWorkorder;
  @Input('technicians')
  allTechnicians!: IntUser[];

  // output
  @Output()
  close: EventEmitter<string> = new EventEmitter<string>();
  @Output() updateWorkorder: EventEmitter<string> = new EventEmitter<string>();

  // template refs
  @ViewChild('closeModalButton') closeModalButton!: ElementRef;
  @ViewChild('buttonSpinner') buttonSpinner!: ElementRef;
  @ViewChild('openModalButton') openModalButton!: ElementRef;


  form!: FormGroup;

  workorder!: IntWorkorder;
  technicians!: IntUser[];

  electricalTechnicians!: IntUser[];
  mechanicalTechnicians!: IntUser[];
  storeTechnicians!: IntUser[];

  changingTechnicians = false;

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    const workorder = changes['selectedWorkorder']?.currentValue;
    const technicians = changes['allTechnicians']?.currentValue;

    this.workorder = workorder;
    this.technicians = technicians;

    this.createForm();
    this.filterTechnicians();

  }

  private createForm(): FormGroup {
    const form = this.fb.group({
      currentEngTechnician: [this.workorder?.technician?.fullName],
      currentStoreTechnician: [
        this.workorder?.storesTechnician?.fullName
      ],
      newEngTechnician: ['', Validators.required],
      newStoreTechnician: ['', Validators.required]
    });

    return this.form = form;
  }

  private filterTechnicians(): any {
    if (this.technicians) {
      this.electricalTechnicians = this.technicians.filter(
        (user: IntUser) =>
          user.technicianGroup === 'Electrical');
      this.mechanicalTechnicians = this.technicians.filter(
        (user: IntUser) =>
          user.technicianGroup === 'Mechanical');
      this.storeTechnicians = this.technicians.filter(
        (user: IntUser) => user.technicianGroup === 'Eng. Store'
          || user.technicianGroup === 'PM Planning'
      );

    }

  }

  private closeButtonSpinner(): void {
    this.changingTechnicians = false;
    if (this.buttonSpinner) {
      this.buttonSpinner.nativeElement.style.display = 'none';
    }
  }

  private updateWorkordersArray(uid: string, update: {}): void {
    this.workordersService.refreshWorkorders(
      uid, update
    ).then(() => this.updateWorkorder.emit(uid));
  }

  closeModal(): void {
    if (this.closeModalButton) {
      this.closeModalButton.nativeElement.click();
      this.close.emit('close');
    }
  }

  updateTechnicians(): void {
    const {
      newEngTechnician,
      newStoreTechnician
    } = this.form?.value;

    if (newEngTechnician === ''
    ) {

      return this.form?.get('newEngTechnician')?.setErrors({ required: true });
    }
    else if (newStoreTechnician === '') {
      return this.form?.get('newStoreTechnician')?.setErrors({ required: true });
    }
    else if (!this.form?.valid) {
      this.toast.close();

      this.toast.error(`Error: Ensure new technicians have been selected, or click cancel to abort changing technicians. Note: you can pick the sexisting technician if you do not want to change him.`,
        { duration: 8000, id: 'change-technicians-error' });
    } else {
      if (this.workorder) {
        this.changingTechnicians = true;
        const workorderNumber = this.workorder.workorder.number;
        const workorderUid = this.workorder.workorder.uid;
        const workorderType = this.workorder.workorder.type;

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
            this.closeButtonSpinner();
            this.closeModal();
            this.updateWorkordersArray(workorderUid, workorderUpdateData);

            this.toast.success(`Success. Technicians on <b>${workorderType
              }</b> workorder <b>${workorderNumber}</b> changed successfully.`);
          })
          .catch(() => {
            this.closeButtonSpinner();
            this.toast.error(`Failed:
              Changing technicians on <b>${workorderType
              }</b> workorder <b>${workorderNumber}</b> failed with error code LW-CT-01. Please try again or report this error code to support for assistance if the issue persists.`,
              { autoClose: false, id: 'error-code-WL-07' });

          });
      }
    }
  }
}
