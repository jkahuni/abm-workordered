import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { IntWorkorder, IntUser } from '@workorders/models/workorders.models';
import { WorkordersService } from '@workorders/services/workorders.service';

@Component({
  selector: 'app-store-technicians-handover-modal',
  templateUrl: './store-technicians-handover-modal.component.html',
  styleUrls: ['./store-technicians-handover-modal.component.scss']
})
export class StoreTechniciansHandoverModalComponent implements OnInit {

  constructor(
    private workordersService: WorkordersService,
    private toast: HotToastService,
    private fb: FormBuilder
  ) { }

  @Input()
  workorder!: IntWorkorder;
  @Input()
  technicians!: IntUser[];

  @ViewChild('closeStoresTechniciansHandoverModal') closeStoresTechniciansHandoverModal!: ElementRef;
  @ViewChild('buttonSpinner') buttonSpinner!: ElementRef;

  form!: FormGroup;
  storeTechnicians!: IntUser[];

  handingOver = false;


  ngOnInit(): void {
    this.createForm();
    this.filterTechnicians();
  }

  private createForm(): FormGroup {
    const form = this.fb.group({
      currentTechnician: [this.workorder?.storesTechnician?.fullName],
      newTechnician: ['', Validators.required]
    });

    return this.form = form;
  }

  private filterTechnicians(): void {
    if (this.technicians) {
      this.storeTechnicians = this.technicians.filter(
        (user: IntUser) => user.technicianGroup === 'Eng. Store'
          || user.technicianGroup === 'PM Planning'
      );
     }
  }

  private closeButtonSpinner(): void {
    this.handingOver = false;

    if (this.buttonSpinner) {
      this.buttonSpinner.nativeElement.style.display = 'none';
    }
  }

  closeModal(): void {
    if (this.closeStoresTechniciansHandoverModal) {
      this.closeStoresTechniciansHandoverModal.nativeElement.click();
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

      this.toast.error(`Error: Please ensure a new technician has been picked, or click on cancel to abort the handover.`, { id: 'stores-technician-handover-error' });
    } else {
      if (this.workorder) {
        this.handingOver = true;

        const workorderUid = this.workorder.workorder.uid;
        const workorderNumber = this.workorder.workorder.number;
        const workorderUpdateData = {
          storesTechnician: newTechnician
        };

        this.workordersService.updateWorkorder(workorderUid, workorderUpdateData)
          .then(() => {
            this.closeButtonSpinner();
            this.closeModal();
            this.toast.success(`Success. Workorder ${workorderNumber} handed over successfully.`,
              { id: 'stores-technician-handover-success' });
          })
          .catch(() => {
            this.closeButtonSpinner();
            this.toast.error(`Failed. Handing over workorder ${workorderNumber} failed with error code LW-STH-01. Please try again or report this error code to support for assistance if the issue persists.`, {
              autoClose: false, id: 'error-code-WL-12'
            });
          });
      }
    }
  }

}
