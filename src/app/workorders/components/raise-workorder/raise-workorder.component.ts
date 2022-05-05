import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-raise-workorder',
  templateUrl: './raise-workorder.component.html',
  styleUrls: ['./raise-workorder.component.scss']
})
export class RaiseWorkorderComponent implements OnInit {

  constructor
    (private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.spinner.show('app-raise-workorder-spinner');
  }

}
