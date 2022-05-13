import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// interfaces
import {
  IntSection, IntExpandedSection
} from '@resources/models/resources.models';

// services
import { ResourcesService } from '@resources/services/resources.service';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-edit-section',
  templateUrl: './edit-section.component.html',
  styleUrls: ['./edit-section.component.scss']
})
export class EditSectionComponent implements OnInit {

  constructor(
    private resourcesService: ResourcesService,
    private fb: FormBuilder,
    private toast: HotToastService,
    private router: Router
  ) { }

  sections!: IntSection[];
  section!: IntSection | undefined;

  form!: FormGroup;

  sectionSelected = false;

  loading = true;
  editingSection = false;

  loadingFailed = false;
  loadingSectionsIndexingError!: string;
  loadingSectionsOtherError!: string;
  loadingSectionsUnknownError = `Loading sections to edit failed with error code UES-01. Please try reloading the page or report this error code to support for assistance in resolving the error.`;


  ngOnInit(): void {
    this.getSections();
  }

  private getSections(): void {
    this.resourcesService.getSections()
      .then((sections: IntSection[]) => {
        this.sections = sections;
        this.createForm();
        this.loading = false;
      })
      .catch((err: any) => {
        this.loading = false;
        this.loadingFailed = true;
        if (err.code === 'failed-precondition') {
          this.loadingSectionsIndexingError = `Loading sections to edit failed with error code IND-ES-01. Please report this error code to support to have it fixed.`;
        } else {
          this.loadingSectionsOtherError = `Loading sections to edit failed with error code ES-01. Please report this error code to support to have it fixed.`;
        }

      });
  }

  private createForm(): FormGroup {
    const form = this.fb.group({
      section: [this.section ? this.section : ''],
      currentName: [this.section?.name],
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

  displaySection(selectedSection: IntSection): IntSection | undefined {
    const integerUid = +selectedSection.uid;
    this.section = this.sections?.find((section: IntSection) =>
      +section.uid === integerUid
    );


    if (this.section) {
      this.createForm();
      this.sectionSelected = true;
    }

    return this.section;

  }

  editSection(): void {
    const {
      section,
      currentName,
      newName
    } = this.form?.value;

    if (section === '' && currentName === null) {
      this.form?.get('section')?.setErrors({ required: true });
    } else if (this.form?.invalid) {
      this.toast.error(`Error: Please ensure new spare name is not blank or invalid.`, { duration: 6000, id: 'blank-or-invalid-new-name' });

    } else {
      this.editingSection = true;
      const ref: string = section.uid;
      const col: string = 'sections';
      const data: IntExpandedSection = {
        id: section.id,
        name: this.formatTitleCase(newName),
        nameLowercase: newName.toLocaleLowerCase()
      };

      this.resourcesService.updateResource(col, ref, data)
        .then(() => {
          this.editingSection = false;
          this.router.navigate(['/']);
          this.toast.success(`Success. Section ${currentName} changed successfully to ${newName}.`, {duration: 12000, id: 'edit-section-success'});
        })
        .catch(() => {
          this.editingSection = false;
          this.toast.error(`Failed. Editing section: ${currentName} failed with error code ES-01. Please try again or report this error code to support to have it fixed. `, {autoClose: false, id: 'edit-section-failure'});
        });
    }

  }
}
