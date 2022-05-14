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

  private createForm(): FormGroup {
    const form = this.fb.group({
      searchSpareTerm: [''],
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
      this.createForm();
      this.spareSelected = true;
    }

    return this.spare;
  }

  private formatTitleCase(term: string): string {
    return term.toLocaleLowerCase()
      .split(' ')
      .map((word: string) => {
        return (word.charAt(0).toUpperCase() + word.slice(1));
      })
      .join(' ');

  }

  editSpare(): void {
    const { spare, code, name, unitCost } = this.form?.value;

    console.log(spare, code, name, unitCost);
  }


}
