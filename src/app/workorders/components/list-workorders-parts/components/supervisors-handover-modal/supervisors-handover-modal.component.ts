import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { IntWorkorder, IntUser } from '@workorders/models/workorders.models';
import { WorkordersService } from '@workorders/services/workorders.service';

@Component({
  selector: 'app-supervisors-handover-modal',
  templateUrl: './supervisors-handover-modal.component.html',
  styleUrls: ['./supervisors-handover-modal.component.scss']
})
export class SupervisorsHandoverModalComponent implements OnInit, OnChanges {

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

  @Input('workorder')
  selectedWorkorder!: IntWorkorder;
  @Input('supervisors')
  allSupervisors!: IntUser[];

  // output
  @Output()
  close: EventEmitter<string> = new EventEmitter<string>();
  @Output() updateWorkorder: EventEmitter<string> = new EventEmitter<string>();

  // template references
  @ViewChild('openModalButton') openModalButton!: ElementRef;
  @ViewChild('closeModalButton') closeModalButton!: ElementRef;
  @ViewChild('buttonSpinner') buttonSpinner!: ElementRef;

  form!: FormGroup;

  workorder!: IntWorkorder;
  supervisors!: IntUser[];

  productionSupervisors!: IntUser[];
  engineeringSupervisors!: IntUser[];

  handingOver = false;

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const workorder = changes['selectedWorkorder']?.currentValue;
    const supervisors = changes['allSupervisors']?.currentValue; 

    this.workorder = workorder;
    this.supervisors = supervisors;

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
        const workorderType = this.workorder.workorder.type;
        const workorderUpdateData = {
          supervisor: newSupervisor
        };

        this.workordersService.updateWorkorder
          (workorderUid,
            workorderUpdateData)
          .then(() => {
            this.closeButtonSpinner();
            this.closeModal();
            this.updateWorkordersArray(workorderUid, workorderUpdateData);
            this.toast.success(`Success.
             <b>${workorderType
              }</b> workorder <b>${workorderNumber}</b> delegated successfully.`, { id: 'supervisor-handover-success' });
          })
          .catch(() => {
            this.closeButtonSpinner();

            this.toast.error(`Failed:
             Delegating <b>${workorderType
              }</b> workorder <b>${workorderNumber}</b> failed with error code LW-SH-01. Please try again or report this error code to support for assistance if the issue persists.`,
              { autoClose: false, id: 'error-code-WL-06' });
          });
      }
    }

  }
}
