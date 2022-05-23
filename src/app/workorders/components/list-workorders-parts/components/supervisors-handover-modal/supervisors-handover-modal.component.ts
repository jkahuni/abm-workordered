import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { IntWorkorder, IntUser } from '@workorders/models/workorders.models';
import { WorkordersService } from '@workorders/services/workorders.service';

@Component({
  selector: 'app-supervisors-handover-modal',
  templateUrl: './supervisors-handover-modal.component.html',
  styleUrls: ['./supervisors-handover-modal.component.scss']
})
export class SupervisorsHandoverModalComponent implements OnInit {

  constructor(
    private workordersService: WorkordersService,
    private fb: FormBuilder,
    private toast: HotToastService,
  ) {
    setTimeout(() => {
      if (this.openModalButton) {
        this.openModalButton.nativeElement.click();
      }
    });
  }

  @Input()
  workorder!: IntWorkorder;
  @Input()
  supervisors!: IntUser[];

  // output
  @Output()
  close: EventEmitter<string> = new EventEmitter<string>();

  // template references
  @ViewChild('openModalButton') openModalButton!: ElementRef;
  @ViewChild('closeModalButton') closeModalButton!: ElementRef;
  @ViewChild('buttonSpinner') buttonSpinner!: ElementRef;

  form!: FormGroup;

  productionSupervisors!: IntUser[];
  engineeringSupervisors!: IntUser[];


  handingOver = false;


  ngOnInit(): void {
    this.createForm();
    this.filterSupervisors();
  }

  private createForm(): FormGroup {
    const form = this.fb.group({
      currentSupervisor: [this.workorder?.supervisor?.fullName],
      newSupervisor: ['', Validators.required]
    });

    return this.form = form;
  }

  private filterSupervisors(): void {
    if (this.supervisors) {
      this.productionSupervisors = this.supervisors.filter(
        (user: IntUser) =>
          user.group === 'Supervisor' && user.supervisorGroup === 'Production'
      );
      this.engineeringSupervisors = this.supervisors.filter(
        (user: IntUser) =>
          user.group === 'Supervisor' && user.supervisorGroup === 'Engineering'
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
    if (this.closeModalButton) {
      this.closeModalButton.nativeElement.click();
      this.close.emit('close');
    }
  }

  handover(): void {
    const {
      newSupervisor
    } = this.form?.value;
    if (newSupervisor === '') {
      return this.form?.get('newSupervisor')?.setErrors({ required: true });
    }
    else if (!this.form.valid) {
      this.toast.close();

      this.toast.error(`Error. Ensure a new supervisor has been selected.`, { id: 'supervisor-handover-error' });
    } else {
      if (this.workorder) {
        this.handingOver = true;

        const workorderNumber = this.workorder.workorder.number;
        const workorderUid = this.workorder.workorder.uid;
        const workorderUpdateData = {
          supervisor: newSupervisor
        };

        this.workordersService.updateWorkorder
          (workorderUid,
            workorderUpdateData)
          .then(() => {
            this.closeButtonSpinner();
            this.closeModal();
            this.toast.success(`Success.
             Workorder ${workorderNumber} delegated successfully.`, { id: 'supervisor-handover-success' });
          })
          .catch(() => {
            this.closeButtonSpinner();

            this.toast.error(`Failed:
             Delegating workorder ${workorderNumber} failed with error code LW-SH-01. Please try again or report this error code to support for assistance if the issue persists.`,
              { autoClose: false, id: 'error-code-WL-06' });
          });
      }
    }

  }
}
