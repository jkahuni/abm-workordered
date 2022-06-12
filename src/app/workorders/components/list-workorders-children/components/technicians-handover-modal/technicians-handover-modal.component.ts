import { Component, ElementRef, Input, OnInit, ViewChild, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { IntWorkorder, IntUser } from '@workorders/models/workorders.models';
import { WorkordersService } from '@workorders/services/workorders.service';
import * as dayjs from 'dayjs';


@Component({
  selector: 'app-technicians-handover-modal',
  templateUrl: './technicians-handover-modal.component.html',
  styleUrls: ['./technicians-handover-modal.component.scss']
})
export class TechniciansHandoverModalComponent implements OnInit, OnChanges {

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

  @Output()
  close: EventEmitter<string> = new EventEmitter<string>();
  @Output() updateWorkorder: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('openModalButton') openModalButton!: ElementRef;
  @ViewChild('closeModalButton') closeModalButton!: ElementRef;
  @ViewChild('buttonSpinner') buttonSpinner!: ElementRef;

  form!: FormGroup;

  workorder!: IntWorkorder;
  technicians!: IntUser[];

  electricalTechnicians!: IntUser[];
  mechanicalTechnicians!: IntUser[];

  handingOver = false;

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
    const form = this.fb.group(
      {
        currentTechnician: [this.workorder?.technician?.fullName],
        newTechnician: ['', Validators.required]
      });

    return this.form = form;
  }

  private filterTechnicians(): any {
    if (this.technicians) {
      this.electricalTechnicians = this.technicians.filter(
        (user: IntUser) => user.technicianGroup === 'Electrical');
      this.mechanicalTechnicians = this.technicians.filter(
        (user: IntUser) => user.technicianGroup === 'Mechanical');
    }
  }

  private closeButtonSpinner(): void {
    this.toast.close();
    this.handingOver = false;

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

  handover(): void {
    const {
      newTechnician
    } = this.form?.value;

    if (newTechnician === '') {
      return this.form?.get('newTechnician')?.setErrors({ required: true });
    }
    else if (this.form.invalid) {
      this.toast.close();

      this.toast.error(`Error: Ensure a new technician has been picked, or click on cancel to abort the handover.`, { id: 'eng-technician-handover-error' });
    } else {
      if (this.workorder) {
        this.handingOver = true;

        const workorderUid = this.workorder.workorder.uid;
        const workorderNumber = this.workorder.workorder.number;
        const workorderType = this.workorder.workorder.type;
        const workorderUpdateData = {
          technician: newTechnician
        };

        this.workordersService.updateWorkorder(workorderUid, workorderUpdateData)
          .then(() => {
            this.closeButtonSpinner();
            this.closeModal();
            this.updateWorkordersArray(workorderUid, workorderUpdateData);

            this.toast.success(`Success. <b>${workorderType
              }</b> workorder <b>${workorderNumber}</b> handed over successfully.`,
              { id: 'eng-technician-handover-success' });
          })
          .catch(() => {
            this.closeButtonSpinner();
            this.toast.error(`Failed. Handing over <b>${workorderType
              }</b> workorder <b>${workorderNumber}</b> failed with error code LW-ETH-01. Please try again or report this error code to support for assistance if the issue persists.`, {
              autoClose: false, id: 'error-code-WL-11'
            });
          });
      }
    }
  }
}
