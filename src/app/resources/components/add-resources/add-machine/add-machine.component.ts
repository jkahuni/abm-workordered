import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// interfaces
import {
  IntMachine, IntExpandedMachine, IntSection, IntResourceMetrics
} from '@resources/models/resources.models';

// services
import { ResourcesService } from '@resources/services/resources.service';
import { HotToastService } from '@ngneat/hot-toast';


@Component({
  selector: 'app-add-machine',
  templateUrl: './add-machine.component.html',
  styleUrls: ['./add-machine.component.scss']
})
export class AddMachineComponent implements OnInit {

  machines!: IntMachine[];
  newMachineId!: number;
  sections!: IntSection[];

  // resource metrics
  totalSpares!: number;
  totalSections!: number;
  totalMachines!: number;

  form!: FormGroup;

  loading = true;
  loadingFailed = false;
  loadingIndexingError!: string;
  loadingOtherError!: string;
  loadingUnknownError = `Loading resources failed with error code UAM-01. Please try reloading the page or report this error code to support for assistance in resolving the error.`;

  addingMachine = false;

  constructor(
    private resourcesService: ResourcesService,
    private fb: FormBuilder,
    private toast: HotToastService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getSections();
    this.getMachines();
  }

  // hide loading spinner
  private hideLoadingSpinner(): boolean {
    let status: boolean = true;
    if (this.sections && this.machines) {
      status = false;
      this.createForm();
      this.getCurrentResourceMetrics();

    } else {
      status = true;
    }
    return this.loading = status;
  }

  // gets resource numbers
  private getCurrentResourceMetrics(): any {
    this.resourcesService.getResourceMetrics()
      .then((data: IntResourceMetrics) => {
        this.totalSpares = data['spares'];
        this.totalSections = data['sections'];
        this.totalMachines = data['machines'];
        this.generateNewMachineId();
      })
      .catch((err: any) => {
        this.generateNewMachineId();
        return;
      });

  }

  // updates resource metrics
  private updateResourceMetrics(): void {
    const data: IntResourceMetrics = {
      spares: this.totalSpares,
      sections: this.totalSections,
      machines: this.totalMachines
    };

    this.resourcesService.updateResourceMetrics(data)
      .catch(() => {
        return;
      })
  }

  // get sections
  private getSections(): void {
    this.resourcesService.getSections()
      .then((sections: IntSection[]) => {
        this.sections = sections;
        this.hideLoadingSpinner();
      })
      .catch((err: any) => {
        this.loading = false;
        this.loadingFailed = true;
        if (err.code === 'failed-precondition') {
          this.loadingIndexingError = `Loading resources failed with error code IND-AM-GS-01. Please report this error code to support to have it fixed.`;
        } else {
          this.loadingOtherError = `Loading resources failed with error code AM-GS-01. Please try reloading the page or report this error code to support to have it fixed.`;
        }
      });
  }

  // get machines 
  private getMachines(): void {
    this.resourcesService.getMachines()
      .then((machines: IntMachine[]) => {
        this.machines = machines;
        this.hideLoadingSpinner();
      })
      .catch((err: any) => {
        this.loading = false;
        this.loadingFailed = true;
        if (err.code === 'failed-precondition') {
          this.loadingIndexingError = `Loading resources failed with error code IND-AM-GM-01. Please report this error code to support to have it fixed.`;
        } else {
          this.loadingOtherError = `Loading resources failed with error code AM-GM-01. Please try reloading the page or report this error code to support to have it fixed.`;
        }
      });
  }

  // create form
  private createForm(): FormGroup {
    const form = this.fb.group({
      section: ['', Validators.required],
      machineName: ['', Validators.required]
    });

    return this.form = form;
  }

  // calculate total machines
  private generateNewMachineId(): number {
    let newMachineId: number = 0;

    const machineIds: number[] = this.machines.map((machine: IntMachine) => +machine.id);

    const maximumMachineId = Math.max(...machineIds);

    newMachineId = maximumMachineId + 1;

    this.totalMachines = newMachineId;

    return this.totalMachines;
  }

  // generate machine uid
  // DISABLED: using machine id as uid
  private generateMachineUid(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let uid = '';

    for (let i = 0; i <= 20; i++) {
      uid += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return uid;
  }

  private formatTitleCase(term: string): string {
    return term.toLocaleLowerCase()
      .split(' ')
      .map((word: string) => {
        return (word.charAt(0).toUpperCase() + word.slice(1));
      })
      .join(' ');

  }

  // confirm machine does not exist
  private confirmUniqueMachine(name: string): boolean {
    const machines: string[] = this.machines.map((machine: IntMachine) => machine.name.toLocaleLowerCase());

    const machineExists = machines.includes(name);

    // returns true if machine does not exist
    return !machineExists;
  }

  // add 
  addMachine(): void {
    const { section, machineName } = this.form?.value;

    if (this.form.invalid) {
      this.toast.error(`Please ensure all required fields are not blank or invalid.`, { duration: 10000, id: 'invalid-add-machine-form' });
    } else {
      this.addingMachine = true;
      const col: string = 'machines';
      const id: number = this.totalMachines;
      // const ref = this.generateWorkorderUid();
      // saves new machines with their indices
      const ref: string = `${id}`;

      const name: string = this.formatTitleCase(machineName);
      const nameLowercase: string = machineName.toLocaleLowerCase();
      const sectionId = section.id

      const data: IntExpandedMachine = {
        id, name, section: sectionId, nameLowercase
      };

      // only add the machine if it 
      // does exist in the db already
      if (this.confirmUniqueMachine(nameLowercase)) {
        this.resourcesService.addResource(col, ref, data)
          .then(() => {
            this.updateResourceMetrics();
            this.addingMachine = false;
            this.router.navigate(['/']);
            this.toast.success(`Success. Machine <b>${name}</b> added successfully to section <b>${section.name}</b>.`, { duration: 12000, id: 'add-machine-success' });

          })
          .catch(() => {
            this.addingMachine = false;
            this.toast.error(`Failed. Adding machine <b>${name}</b> added to section <b>${section.name}</b> fialed. Please try again or report this issue to support to have if fixed.`, { autoClose: false, id: 'add-machine-fialure' });
          });
      }
      else {
        this.addingMachine = false;
        this.toast.info(`Machine <b>${name}</b> already exists. Did you perhaps want to edit it instead?`);
      }
    }
  }
}
