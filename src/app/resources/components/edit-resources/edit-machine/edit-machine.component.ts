import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// interfaces
import {
  IntMachine, IntExpandedMachine
} from '@resources/models/resources.models';

// services
import { ResourcesService } from '@resources/services/resources.service';
import { HotToastService } from '@ngneat/hot-toast';


@Component({
  selector: 'app-edit-machine',
  templateUrl: './edit-machine.component.html',
  styleUrls: ['./edit-machine.component.scss']
})
export class EditMachineComponent implements OnInit {

  constructor(
    private resourcesService: ResourcesService,
    private fb: FormBuilder,
    private toast: HotToastService,
    private router: Router
  ) { }

  machines!: IntMachine[];
  machine!: IntMachine | undefined;

  form!: FormGroup;

  machineSelected = false;

  loading = true;
  editingMachine = false;

  loadingFailed = false;
  loadingMachinesIndexingError!: string;
  loadingMachinesOtherError!: string;
  loadingMachinesUnknownError = `Loading machines to edit failed with error code UEM-01. Please try reloading the page or report this error code to support for assistance in resolving the error.`;

  ngOnInit(): void {
    this.getMachines();
  }

  private getMachines(): void {
    this.resourcesService.getMachines()
      .then((machines: IntMachine[]) => {
        this.machines = machines;
        this.createForm();
        this.loading = false;
      })
      .catch((err: any) => {
        this.loading = false;
        this.loadingFailed = true;
        if (err.code === 'failed-precondition') {
          this.loadingMachinesIndexingError = `Loading machines to edit failed with error code IND-EM-01. Please report this error code to support to have it fixed.`;
        } else {
          this.loadingMachinesOtherError = `Loading machines to edit failed with error code EM-01. Please try reloading the parge or report this error code to support to have it fixed.`;
        }
      });
  }

  private createForm(): FormGroup {
    const form = this.fb.group({
      machine: [this.machine ? this.machine : ''],
      currentName: [this.machine?.name],
      newName: ['', Validators.required],
    });

    return this.form = form;
  }

  private formatTitleCase(term: string): string {
    return term.toLocaleLowerCase()
      .split(' ')
      .map((word: string) => {
        return (word.charAt(0).toUpperCase() + word.slice(1));
      })
      .join(' ');

  }

  displayMachine(machine: IntMachine): IntMachine | undefined {
    const machineUid = machine.uid;
    this.machine = this.machines?.find((machine: IntMachine) => machine.uid === machineUid);

    if (this.machine) {
      this.createForm();
      this.machineSelected = true;
    }

    return this.machine;
  }

  editMachine(): void {
    const { machine,
      currentName,
      newName
    } = this.form?.value;

    const { uid, id, section } = machine;

    if (machine === '' && currentName === null) {
      this.form?.get('machine')?.setErrors({ required: true });
    } else if (this.form?.invalid) {
      this.toast.error(`Error: Please ensure new machine name is not blank or invalid.`, { duration: 6000, id: 'blank-or-invalid-new-name' });

    } else {
      this.editingMachine = true;
      const col = 'machines';
      const ref = uid;
      const name = this.formatTitleCase(newName);
      const data: IntExpandedMachine = {
        id,
        name,
        nameLowercase: newName.toLocaleLowerCase(),
        section
      };

      this.resourcesService.updateResource(col, ref, data)
        .then(() => {
          this.editingMachine = false;
          this.router.navigate(['/']);
          this.toast.success(`Success. Machine: ${currentName} changed successfully to: ${name}`,
            { duration: 12000, id: 'edit-resource-success' });
        })
        .catch(() => {
          this.editingMachine = false;
          this.toast.error(`Failed. Editing machine: ${currentName} failed with error code EM-01. Please try again or report this error code to support to have it fixed. `, { autoClose: false, id: 'edit-resource-failure' });
        });
    }

  }

}
