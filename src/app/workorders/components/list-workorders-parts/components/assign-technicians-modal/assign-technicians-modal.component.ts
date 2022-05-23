import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { IntWorkorder, IntUser } from '@workorders/models/workorders.models';
import { WorkordersService } from '@workorders/services/workorders.service';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-assign-technicians-modal',
  templateUrl: './assign-technicians-modal.component.html',
  styleUrls: ['./assign-technicians-modal.component.scss']
})
export class AssignTechniciansModalComponent implements OnInit {

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

  // inputs
  @Input()
  workorder!: IntWorkorder;
  @Input()
  technicians!: IntUser[];

  // output
  @Output()
  close: EventEmitter<string> = new EventEmitter<string>();

  // template refs
  @ViewChild('openModalButton') openModalButton!: ElementRef;
  @ViewChild('closeModalButton') closeModalButton!: ElementRef;
  @ViewChild('buttonSpinner') buttonSpinner!: ElementRef;


  form!: FormGroup;
  electricalTechnicians!: IntUser[];
  mechanicalTechnicians!: IntUser[];
  storeTechnicians!: IntUser[];

  assigningTechnicians = false;

  ngOnInit(): void {
    this.createForm();
    this.filterTechnicians();
  }

  private createForm(): FormGroup {
    const form = this.fb.group({
      engTechnician: ['', Validators.required],
      storeTechnician: ['', Validators.required]
    });

    return this.form = form;
  }

  private filterTechnicians(): any {
    if (this.technicians) {
      this.electricalTechnicians = this.technicians.filter(
        (user: IntUser) => user.technicianGroup === 'Electrical');
      this.mechanicalTechnicians = this.technicians.filter(
        (user: IntUser) => user.technicianGroup === 'Mechanical');
      this.storeTechnicians = this.technicians.filter(
        (user: IntUser) => user.technicianGroup === 'Eng. Store'
          || user.technicianGroup === 'PM Planning'
      );
    }
  }

  private closeButtonSpinner(): void {
    this.assigningTechnicians = false;

    if (this.buttonSpinner) {
      this.buttonSpinner.nativeElement.style.display = 'none';
    }
  }

  closeModal(): void {
    if (this.closeModalButton) {
      this.closeModalButton.nativeElement.click();
      this.close.emit('close');
    }
  }

  assignTechnicians(): void {
    const {
      engTechnician,
      storeTechnician
    } = this.form?.value;

    if (engTechnician === '') {
      return this.form?.get('engTechnician')?.setErrors({ required: true });
    }

    else if (storeTechnician === '') {
      return this.form?.get('storeTechnician')?.setErrors({ required: true });
    }

    else if (!this.form?.valid) {
      this.toast.close();

      this.toast.error(`Error: Ensure engineering and store technicians have been selected.`,
        { duration: 5000, id: 'assign-technicians-error' });
    } else {
      if (this.workorder) {
        this.assigningTechnicians = true;
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
            this.closeButtonSpinner();
            this.closeModal();

            this.toast.success(`Success. Technicians assigned to workorder ${workorderNumber} successfully.`, { id: 'assign-technicians-success' });
          })
          .catch(() => {
            this.closeButtonSpinner();
            this.toast.error(`Failed:
              Assigning technicians to workorder ${workorderNumber} failed with error code LW-AT-01. Please try again or report this error code to support for assistance if the issue persists.`,
              { autoClose: false, id: 'error-code-WL-08' });
          });

      }
    }
  }
}
