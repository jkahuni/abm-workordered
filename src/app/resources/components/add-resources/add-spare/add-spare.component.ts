import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// interfaces
import {
  IntMachine, IntExpandedMachine, IntSection, IntSpare, IntResourceMetrics, IntExpandedSpare
} from '@resources/models/resources.models';

// services
import { ResourcesService } from '@resources/services/resources.service';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-add-spare',
  templateUrl: './add-spare.component.html',
  styleUrls: ['./add-spare.component.scss']
})
export class AddSpareComponent implements OnInit {
  spares!: number;
  sections!: number;
  machines!: number;
  newSpareId!: number;

  form!: FormGroup;

  loading = true;
  loadingFailed = false;
  loadingOtherError!: string;
  loadingUnknownError = `Loading resources failed with error code UASp-01. Please try reloading the page or report this error code to support for assistance in resolving the error.`;

  addingSpare = false;

  constructor(
    private resourcesService: ResourcesService,
    private fb: FormBuilder,
    private toast: HotToastService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getCurrentResourceMetrics();
  }

  // get last spare ID
  private getCurrentResourceMetrics(): any {
    this.resourcesService.getResourceMetrics()
      .then((data: IntResourceMetrics) => {
        this.spares = data['spares'];
        this.sections = data['sections'];
        this.machines = data['machines'];
        this.loading = false;
        this.createForm();
        this.generateUniqueSpareId();
      })
      .catch((err: any) => {
        this.loading = false;
        this.loadingFailed = true;
        this.loadingOtherError = `Loading resources failed with error code ASp-GRM-01. Please try reloading the page or report this error code to support to have it fixed.`;
      });

  }

  // create form
  private createForm(): FormGroup {
    const form = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      unitCost: ['', Validators.required],
      machine: ['']
    });

    return this.form = form;
  }

  // save unique spare to db
  private persistNewSpareToDb(col: string, ref: string, data: IntExpandedSpare): void {
    this.resourcesService.addResource(col, ref, data)
      .then(() => {
        this.addingSpare = false;
        this.updateResourceMetrics();
        this.router.navigate(['/']);
        this.toast.success(`Success. Spare <b>${data.code}</b> added successfully.`, { duration: 12000, id: 'success-adding-spare' });
      })
      .catch(() => {
        this.addingSpare = false;
        this.toast.error(`Failed. An error occured while adding spare <b>${data.code}</b>. Please try again or report the error for assistance`, { autoClose: false, id: 'failed-adding-spare' });
      });
  }

  private updateResourceMetrics(): void {
    const data: IntResourceMetrics = {
      spares: this.newSpareId,
      sections: this.sections,
      machines: this.machines
    };

    this.resourcesService.updateResourceMetrics(data)
      .catch(() => {
        this.toast.error(`An error occured while updating resources information. Please try again or contact support for assistance.`);
      })
  }

  // generate unique ID
  private generateUniqueSpareId(): number {
    return this.newSpareId = this.spares + 1;
  }

  // name in title format
  private formatTitleCase(term: string): string {
    return term.toLocaleLowerCase()
      .split(' ')
      .map((word: string) => {
        return (word.charAt(0).toUpperCase() + word.slice(1));
      })
      .join(' ');

  }

  // generate search params array
  private generateSearchParams(code: string, name: string): string[] {
    const lowercaseName: string = name.toLocaleLowerCase();
    const lowercaseCode = code.toLocaleLowerCase();

    const splitNames: string[] = lowercaseName.split(/[,#x:\/\\\s\*\+\.\-\(\)\'\"]+/);
    const splitCode: string[] = lowercaseCode.split(/[,#x:\/\\\s\*\+\.\-\(\)\'\"]+/);

    const codeAndNamesArray: string[] = [... new Set(splitNames.concat(splitCode))];
    let searchParamsArray: string[] = [];


    codeAndNamesArray.forEach(
      (word: string) => {
        if (word.length >= 4) {
          // account for codes such as ea01
          const firstBatch = word.substring(0, 2);
          const secondBatch = word.substring(2, 4);
          const thirdBatch = word.substring(4);


          // account for codes such as les001
          const fourthBatch = word.substring(0, 3);
          const fifthBatch = word.substring(3, 6);
          const sixthBatch = word.substring(6);

          searchParamsArray.push(
            firstBatch,
            secondBatch,
            thirdBatch,
            fourthBatch,
            fifthBatch,
            sixthBatch
          );
        }
      }
    );

    // remove empty strings
    const searchParams = (codeAndNamesArray.concat(searchParamsArray)).filter(
      (param: string) => param);

    return searchParams;
  }

  // add spare
  addSpare(): void {
    const { code, name, unitCost, machine } = this.form?.value;

    if (!unitCost || unitCost === '0' || +unitCost === 0) {
      setTimeout(() => {
        this.form?.get('unitCost')?.setErrors({
          invalidUnitCost: {
            errorMessage: `Cost cannot be ${unitCost
              }. Enter a valid cost.`
          }
        });
      });
    }

    else if (this.form?.invalid) {
      this.toast.error(`Please ensure all required fields are not blank or invalid.`, { autoClose: false, id: 'invalid-edit-spares-form' });
    }

    else {
      this.addingSpare = true;

      const col = 'spares';


      const id = this.newSpareId;
      const spareCode = code.toUpperCase();
      const codeLowercase = code.toLocaleLowerCase();

      const ref = `${spareCode}`;

      const spareName = this.formatTitleCase(name);
      const nameLowercase = name.toLocaleLowerCase();
      const spareMachine = this.formatTitleCase(machine || 'local engineering spare.');
      const machineLowercase = spareMachine.toLocaleLowerCase();
      const searchParams = this.generateSearchParams(code, name);

      const data: IntExpandedSpare = {
        id,
        code: spareCode,
        codeLowercase,
        name: spareName,
        nameLowercase,
        machine: spareMachine,
        machineLowercase,
        searchParams,
        unitCost
      };

      // confirm spare is unique
      this.resourcesService.getSpares(codeLowercase)
        .then((spares: IntSpare[]) => {
          // spare exists
          if (spares.length > 0) {
            this.addingSpare = false;
            this.toast.error(`A spare with <b>code ${spareCode}</b> already exists. Did you mean to edit this spare instead ?.`)
          }
          // spare is unique
          else {
            this.persistNewSpareToDb(col, ref, data);
          }
        })
        .catch(() => {
          this.addingSpare = false;

          this.toast.error(`An error occured while checking if the spare code is unique. Please try again.`)
        });




    }


  }
}
