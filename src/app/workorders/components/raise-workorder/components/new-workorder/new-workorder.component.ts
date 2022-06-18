import { Component, OnInit, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-new-workorder',
  templateUrl: './new-workorder.component.html',
  styleUrls: ['./new-workorder.component.scss']
})
export class NewWorkorderComponent implements OnInit {


  @Output() workorderTypeSelected: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

  updateWorkorderType(type: string): void {
    this.workorderTypeSelected.emit(type);
  }
}
