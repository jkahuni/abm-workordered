import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { IntWorkorder, IntUser } from '@workorders/models/workorders.models';
import { WorkordersService } from '@workorders/services/workorders.service';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-raise-concern-modal',
  templateUrl: './raise-concern-modal.component.html',
  styleUrls: ['./raise-concern-modal.component.scss']
})
export class RaiseConcernModalComponent implements OnInit, OnChanges {

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

  // output
  @Output()
  close: EventEmitter<string> = new EventEmitter<string>();
  @Output() updateWorkorder: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('openModalButton') openModalButton!: ElementRef;
  @ViewChild('closeModalButton') closeModalButton!: ElementRef;
  @ViewChild('buttonSpinner') buttonSpinner!: ElementRef;


  form!: FormGroup;

  workorder!: IntWorkorder;

  users: IntUser[] = [];

  raisingConcern = false;

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const workorder = changes['selectedWorkorder']?.currentValue;

    this.workorder = workorder;

    this.createForm();
    this.getUsers();
  }

  private getUsers(): any {
    if (this.workorder) {
      this.users.push(
        this.workorder.raiser,
        this.workorder.supervisor!,
        this.workorder.technician!,
        this.workorder.storesTechnician!
      );
    }
  }

  private createForm(): FormGroup {
    const form = this.fb.group({
      user: ['', Validators.required],
      concern: ['', Validators.required]
    });

    return this.form = form;
  }


  private closeButtonSpinner(): void {
    this.raisingConcern = false;
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

  raiseConcern(): void {
    const { user, concern } = this.form?.value;

    if (user === '') {
      this.form?.get('user')?.setErrors({
        required: true
      });
    }

    else if (concern === '') {
      this.form?.get('concern')?.setErrors({
        required: true
      });
    }

    else if (this.form?.invalid) {
      this.toast.error(`Error: Ensure user and concern fields are not blank or invalid.`, { duration: 5000, id: 'raise-concern-invalid-form' });
    }

    else {
      if (this.workorder) {
        this.raisingConcern = true;
        const workorderUid = this.workorder.workorder.uid;
        const workorderNumber = this.workorder.workorder.number;
        const workorderType = this.workorder.workorder.type;
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
            this.closeButtonSpinner();
            this.closeModal();
            this.updateWorkordersArray(workorderUid, workorderUpdateData);
            this.toast.success(`Success. Concern on <b>${workorderType
              }</b> workorder <b>${workorderNumber}</b> raised successfully.`, { duration: 6000, id: 'raise-concern-success' });
          })
          .catch(() => {
            this.closeButtonSpinner();
            this.toast.error(`Failed. Raising concern on <b>${workorderType
              }</b> workorder <b>${workorderNumber}</b> failed with error code LW-RC-01. Please try again or report ths error code to support for assistance.`, { id: 'raise-concern-error-2', autoClose: false });
          });
      }
    }
  }
}
