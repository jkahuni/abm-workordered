import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { ResourcesService } from '@resources/services/resources.service';
import { IntWorkorder } from '@workorders/models/workorders.models';
import { WorkordersService } from '@workorders/services/workorders.service';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-reject-workorder-modal',
  templateUrl: './reject-workorder-modal.component.html',
  styleUrls: ['./reject-workorder-modal.component.scss']
})
export class RejectWorkorderModalComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private workordersService: WorkordersService,
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

  // output
  @Output()
  close: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('openModalButton') openModalButton!: ElementRef;
  @ViewChild('closeModalButton') closeModalButton!: ElementRef;
  @ViewChild('buttonSpinner') buttonSpinner!: ElementRef;

  form!: FormGroup;
  rejectingWorkorder = false;

  ngOnInit(): void {
    this.createForm();
  }

  private createForm(): FormGroup {
    const form = this.fb.group({
      reason: ['', Validators.required]
    });

    return this.form = form;
  }

  private closeButtonSpinner() {
    this.toast.close();
    this.rejectingWorkorder = false;
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

  reject(): void {
    const {
      reason
    } = this.form?.value;

    if (reason === '') {
      return this.form?.get('reason')?.setErrors({
        required: true
      });
    }
    else if (this.form.invalid) {
      this.toast.close();
      this.toast.error(`Error: Ensure the reason for rejecting the workorder is not blank or invalid`, {
        id: 'reject-error'
      });

    } else {
      if (this.workorder) {
        this.rejectingWorkorder = true;

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
            this.closeModal();
            this.closeButtonSpinner();

            this.toast.success(`Success.
             Workorder ${workorderNumber} rejected successfully.`, { id: 'reject-success' });

          })
          .catch(() => {
            this.closeButtonSpinner();
            this.toast.error(`Failed:
             Rejecting workorder ${workorderNumber} failed with error code LW-RW-01.
              Please try again, or report the error code to support for assistance if the issue persists.`, { autoClose: false, id: 'error-code-WL-05' });
          });

      }

    }
  }

}
