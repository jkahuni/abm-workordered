import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-resources',
  templateUrl: './add-resources.component.html',
  styleUrls: ['./add-resources.component.scss']
})
export class AddResourcesComponent implements OnInit {

  noResourceSelected = true;
  addSection = false;
  addMachine = false;
  addSpare = false;

  constructor() { }

  ngOnInit(): void {
  }

  private hideAllResourceChildren(): void {
    this.addSection = false;
    this.addMachine = false;
    this.addSpare = false;
    this.noResourceSelected = true;
  }

  addResource(type: string): void {
    this.hideAllResourceChildren();

    if (type === 'section') {
      this.addSection = true;
    }

    else if (type === 'machine') {
      this.addMachine = true;
    }

    else if (type === 'spare') {
      this.addSpare = true;
    } else {
      this.hideAllResourceChildren();
    }
    this.noResourceSelected = false;
  }
}
