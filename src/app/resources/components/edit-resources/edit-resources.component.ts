import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-resources',
  templateUrl: './edit-resources.component.html',
  styleUrls: ['./edit-resources.component.scss']
})
export class EditResourcesComponent implements OnInit {

  noResourceSelected = true;
  editSection = false;
  editMachine = false;
  editSpare = false;

  constructor() { }

  ngOnInit(): void {
  }

  private hideAllResourceChildren(): void {
    this.editSection = false;
    this.editMachine = false;
    this.editSpare = false;
    this.noResourceSelected = true;
  }

  editResource(type: string): void {
    this.hideAllResourceChildren();

    if (type === 'section') {
      this.editSection = true;
    }

    else if (type === 'machine') {
      this.editMachine = true;
    }

    else if (type === 'spare') {
      this.editSpare = true;
    } else {
      this.hideAllResourceChildren();
    }
    this.noResourceSelected = false;
  }
}
