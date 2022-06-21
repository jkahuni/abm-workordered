import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// interfaces
import {
  IntExpandedSection, IntResourceMetrics, IntSection
} from '@resources/models/resources.models';

// services
import { ResourcesService } from '@resources/services/resources.service';
import { HotToastService } from '@ngneat/hot-toast';


@Component({
  selector: 'app-add-section',
  templateUrl: './add-section.component.html',
  styleUrls: ['./add-section.component.scss']
})
export class AddSectionComponent implements OnInit {

  sections!: IntSection[];
  newSectionId!: number;

  // resource metrics
  totalSpares!: number;
  totalSections!: number;
  totalMachines!: number;

  form!: FormGroup;

  loading = true;
  loadingFailed = false;
  loadingIndexingError!: string;
  loadingOtherError!: string;
  loadingUnknownError = `Loading resources failed with error code UAS-01. Please try reloading the page or report this error code to support for assistance in resolving the error.`;

  addingSection = false;

  constructor(
    private resourcesService: ResourcesService,
    private fb: FormBuilder,
    private toast: HotToastService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getSections();
  }

  // hide loading spinner
  private hideLoadingSpinner(): boolean {
    let status = true;
    if (this.sections) {
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
        this.generateNewSectionId();

      })
      .catch((err: any) => {
        this.generateNewSectionId();
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
          this.loadingIndexingError = `Loading resources failed with error code IND-AS-GS-01. Please report this error code to support to have it fixed.`;
        } else {
          this.loadingOtherError = `Loading resources failed with error code AS-GS-01. Please try reloading the page or report this error code to support to have it fixed.`;
        }
      });
  }

  // create form
  private createForm(): FormGroup {
    const form = this.fb.group({
      name: ['', Validators.required]
    });

    return this.form = form;
  }

  // generate new section ID
  private generateNewSectionId(): number {
    const sectionIds: number[] = this.sections.map(
      (section: IntSection) => +section.id
    );

    const maximumSectionId = Math.max(...sectionIds);

    const newSectionId = maximumSectionId + 1;

    this.totalSections = newSectionId;
    return this.totalSections;
  }

  // for formatting name in title case
  private formatTitleCase(term: string): string {
    return term.toLocaleLowerCase()
      .split(' ')
      .map((word: string) => {
        return (word.charAt(0).toUpperCase() + word.slice(1));
      })
      .join(' ');

  }

  // confirm unique section
  private confirmUniqueSection(name: string): boolean {
    const sections = this.sections.map((section: IntSection) => section.name.toLocaleLowerCase());

    const sectionExists = sections.includes(name);

    return !sectionExists;
  }

  // add new section
  addSection(): void {
    const { name } = this.form?.value;

    if (this.form?.invalid) {
      this.toast.error(`Please ensure all required fields are not blank or invalid.`, { duration: 10000, id: 'invalid-add-machine-form' });
    } else {
      this.addingSection = true;

      const col: string = 'sections';
      const ref: string = `${this.totalSections}`;
      const id = ref;
      const sectionName: string = this.formatTitleCase(name);
      const nameLowercase: string = sectionName.toLocaleLowerCase();

      const data: IntExpandedSection = {
        id, name: sectionName, nameLowercase
      };

      // only add section if it does not exist
      if (this.confirmUniqueSection(nameLowercase)) {
        this.resourcesService.addResource(col, ref, data)
          .then(() => {
            this.updateResourceMetrics();
            this.addingSection = false;
            this.router.navigate(['/']);
            this.toast.success(`Success. Section <b>${sectionName}</b> successfully added.`, { duration: 12000, id: 'section-added-success' });
          })
          .catch(
            () => {
              this.addingSection = false;
              this.toast.error(`Failed. Adding section <b>${sectionName}</b> failed. Please try again or report this error to support for assistance.`, { autoClose: false, id: 'adding-section-failure' });
            }
          );
      }

      else {
        this.addingSection = false;
        this.toast.info(`Section <b>${sectionName}</b> already exists. Did you perhaps want to edit it instead?`);

      }
    }
  }
}
