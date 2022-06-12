import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { IntWorkorder } from '@workorders/models/workorders.models';


@Component({
  selector: 'app-help-modal',
  templateUrl: './help-modal.component.html',
  styleUrls: ['./help-modal.component.scss']
})
export class HelpModalComponent implements OnInit {

  constructor() {
    setTimeout(() => {
      if (this.openModalButton) {
        this.openModalButton.nativeElement.click();
      }
    });
  }


  @Input()
  workorder!: IntWorkorder;
  @Input('user')
  userType!: string | null;

  // output
  @Output()
  close: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('openModalButton') openModalButton!: ElementRef;

  ngOnInit(): void {
  }

  closeModal(): void {
    this.close.emit('close');
  }
}
