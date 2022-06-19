import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// rxjs
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';


// interfaces
import {
  IntSpare, IntExpandedSpare
} from '@resources/models/resources.models';

// services
import { ResourcesService } from '@resources/services/resources.service';
import { HotToastService } from '@ngneat/hot-toast';


@Component({
  selector: 'app-edit-spare',
  templateUrl: './edit-spare.component.html',
  styleUrls: ['./edit-spare.component.scss']
})
export class EditSpareComponent implements OnInit {

  constructor(
    private resourcesService: ResourcesService,
    private fb: FormBuilder,
    private toast: HotToastService,
    private router: Router
  ) {
    this.searchSparesSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged())
      .subscribe((searchTerm: string) =>
        this.getSpares(searchTerm));
  }

  // for searching spares
  private searchSparesSubject = new Subject<string>();


  spares!: IntSpare[];
  spare!: IntSpare | undefined;

  form!: FormGroup;

  spareSelected = false;

  loading = false;
  editingSpare = false;

  loadingFailed = false;
  loadingSparesIndexingError!: string;
  loadingSparesOtherError!: string;
  loadingSparesUnknownError = `Loading spares to edit failed with error code UESP-01. Please try reloading the page or report this error code to support for assistance in resolving the error.`;

  ngOnInit(): void {
    this.createForm();
  }


  private getSpares(searchTerm: string): void {
    this.loading = true;
    this.resourcesService.getSpares(searchTerm)
      .then((spares: IntSpare[]) => {
        this.spares = spares;
        this.loading = false;
      })
      .catch((err: any) => {
        this.loading = false;
        this.loadingFailed = true;
        if (err.code === 'failed-precondition') {
          this.loadingSparesIndexingError = `Loading sections to edit failed with error code IND-ESP-01. Please report this error code to support to have it fixed.`;
        } else {
          this.loadingSparesOtherError = `Loading sections to edit failed with error code ESP-01. Please report this error code to support to have it fixed.`;
        }

      });
  }

  private createForm(spareCode?: string): FormGroup {
    const form = this.fb.group({
      searchSpareTerm: [spareCode ? spareCode : ''],
      spare: [this.spare ? this.spare : ''],
      code: [this.spare ? this.spare.code : '', Validators.required],
      name: [this.spare ? this.spare.name : '', Validators.required],
      unitCost: [this.spare ? this.spare.unitCost : '', Validators.required],
    });

    this.validateSpareCost(form);

    return this.form = form;
  }

  // ensure cost is a valid integer
  private validateSpareCost(form: FormGroup): void {
    form.get('unitCost')?.valueChanges
      .subscribe((newCost: string) => {
        const formattedCost = newCost.replace(/,/g, '');
        if (isNaN(+formattedCost)) {
          setTimeout(() => {
            this.form?.get('unitCost')?.setErrors({
              invalidUnitCost: {
                errorMessage: `${newCost
                  } is invalid. Enter a valid number.`
              }
            });
          });
        }
      });
  }

  private formatTitleCase(term: string): string {
    return term.toLocaleLowerCase()
      .split(' ')
      .map((word: string) => {
        return (word.charAt(0).toUpperCase() + word.slice(1));
      })
      .join(' ');

  }

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

  private coreParamsChanged(code: string, name: string, spare: IntSpare): boolean {
    const codeLowercase = code.toLocaleLowerCase();
    const nameLowercase = name.toLocaleLowerCase();

    const spareCodeLowercase = spare.code.toLocaleLowerCase();
    const spareNameLowercase = spare.name.toLocaleLowerCase();

    return codeLowercase !== spareCodeLowercase || nameLowercase !== spareNameLowercase ? true : false;

  }

  // fn called from search input field keyup event
  searchSpares(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement)
      .value.trim().toLocaleLowerCase();

    return this.searchSparesSubject.next(searchTerm);
  }

  displaySpare(selectedSpare: IntSpare): IntSpare | undefined {
    this.spare = this.spares?.find((spare: IntSpare) => {
      return +spare.uid === +selectedSpare.uid;
    });

    if (this.spare) {
      this.createForm(this.spare.code);
      this.spareSelected = true;
    }

    return this.spare;
  }

  editSpare(): void {
    const { spare, code, name, unitCost } = this.form?.value;

    const { uid, id, searchParams } = spare;

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
      this.editingSpare = true;

      const ref: string = uid;
      const col: string = 'spares';

      const data: IntExpandedSpare = {
        id,
        code: code.toUpperCase(),
        codeLowercase: code.toLocaleLowerCase(),
        name: this.formatTitleCase(name),
        nameLowercase: name.toLocaleLowerCase(),
        unitCost,
        searchParams: this.coreParamsChanged(code, name, spare) ? this.generateSearchParams(code, name) : searchParams
      };

      this.resourcesService.updateResource(col, ref, data)
        .then(() => {
          this.editingSpare = false;
          this.router.navigate(['/']);
          this.toast.success(`Success. Spare ${code} editted successfully.`, { duration: 12000, id: 'edit-spare-success' });
        })
        .catch(() => {
          this.editingSpare = false;
          this.toast.error(`Failed. Editing spare ${code} failed with error code <b>ESp-01</b>. Please try again or report this error code to support for assistance.`, { autoClose: false, id: 'edit-spare-failed' });
        });
    }
  }
}
