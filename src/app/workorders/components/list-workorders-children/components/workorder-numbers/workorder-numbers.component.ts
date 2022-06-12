import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { IntWorkorder } from '@workorders/models/workorders.models';
import * as dayjs from 'dayjs';
import * as weekOfYear from 'dayjs/plugin/weekOfYear';
import * as isToday from 'dayjs/plugin/isToday';
import * as isYesterday from 'dayjs/plugin/isYesterday';

dayjs.extend(weekOfYear);
dayjs.extend(isToday);
dayjs.extend(isYesterday);


@Component({
  selector: 'app-workorder-numbers',
  templateUrl: './workorder-numbers.component.html',
  styleUrls: ['./workorder-numbers.component.scss']
})
export class WorkorderNumbersComponent implements OnInit, OnChanges {

  constructor() { }


  @Input() workorders!: IntWorkorder[];
  @Input() loadingAllWorkorders!: boolean;
  @Input() loadingAllWorkordersFailed!: boolean;

  @Output() displayCurrentWorkorder: EventEmitter<IntWorkorder> = new EventEmitter<IntWorkorder>();
  @Output() workordersFiltered: EventEmitter<IntWorkorder[]> = new EventEmitter<IntWorkorder[]>();

  workordersToDisplay!: IntWorkorder[];

  // filter workorders
  showWorkordersFilterOptions = false;
  filterOption!: string;

  loadingWorkorders!: boolean;
  loadingWorkordersFailed!: boolean;

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const workorders = changes['workorders']?.currentValue;
    const loading = changes['loadingAllWorkorders']?.currentValue;
    const loadingFailed = changes['loadingAllWorkordersFailed']?.currentValue;
    this.workordersToDisplay = workorders;
    this.loadingWorkorders = loading;
    this.loadingWorkordersFailed = loadingFailed;
  }

  // filter workorder fns
  private filterTodaysWorkorders(date: string): boolean {
    const dateRaised = dayjs(date);
    return dateRaised && dateRaised.isToday() ? true : false;
  }

  private filterYesterdaysWorkorders(date: string): boolean {
    const dateRaised = dayjs(date);

    return dateRaised && dateRaised.isYesterday() ? true : false;
  }

  private filterThisWeeksWorkorders(date: string): boolean {
    const now = dayjs();
    const dateRaised = dayjs(date);
    const yearsDifference = dateRaised.year() - now.year();
    const monthsDifference = dateRaised.month() - now.month();
    const weeksDifference = dateRaised.week() - now.week();

    return yearsDifference === 0 && monthsDifference === 0 && weeksDifference === 0 ? true : false;

  }

  private filterLastWeeksWorkorders(date: string): boolean {
    const now = dayjs();
    const dateRaised = dayjs(date);

    const yearsDifference = dateRaised.year() - now.year();
    const monthsDifference = dateRaised.month() - now.month();
    const weeksDifference = dateRaised.week() - now.week();

    return yearsDifference === 0 && monthsDifference === 0 && weeksDifference === -1 ? true : false;
  }

  private filterThisMonthsWorkorders(date: string): boolean {
    const now = dayjs();
    const dateRaised = dayjs(date);

    const yearsDifference = dateRaised.year() - now.year();
    const monthsDifference = dateRaised.month() - now.month();

    return yearsDifference === 0 && monthsDifference === 0 ? true : false;
  }

  private filterLastMonthsWorkorders(date: string): boolean {
    const now = dayjs();
    const dateRaised = dayjs(date);

    const yearsDifference = dateRaised.year() - now.year();
    const monthsDifference = dateRaised.month() - now.month();

    return yearsDifference === 0 && monthsDifference === -1 ? true : false;
  }

  displayWorkorder(workorder: IntWorkorder): void {
    return this.displayCurrentWorkorder.emit(workorder);
  }

  filterWorkordersByDateRaised(filterOption: string): IntWorkorder[] {
    let workordersArray: IntWorkorder[] = [];
    if (filterOption) {
      this.filterOption = filterOption;
      workordersArray = this.workorders
        .filter((workorder: IntWorkorder) => {
          const date = workorder.raised.dateTime;
          if (filterOption === 'Today') {
            return this.filterTodaysWorkorders(date) ? workorder : null;
          } else if (filterOption === 'Yesterday') {
            return this.filterYesterdaysWorkorders(date);
          }
          else if (filterOption === 'This Week') {
            return this.filterThisWeeksWorkorders(date);
          }
          else if (filterOption === 'Last Week') {
            return this.filterLastWeeksWorkorders(date);
          }
          else if (filterOption === 'This Month') {
            return this.filterThisMonthsWorkorders(date);
          }
          else if (filterOption === 'Last Month') {
            return this.filterLastMonthsWorkorders(date);
          }
          else if (filterOption === 'None') {
            return true;
          }
          else {
            this.workordersToDisplay = this.workorders;
            return this.workordersToDisplay;
          }
        });

    }

    this.workordersToDisplay = workordersArray;
    this.showWorkordersFilterOptions = false;
    this.workordersFiltered.emit(this.workordersToDisplay);
    return this.workordersToDisplay;



  }

  filterWorkordersByType(type: string): IntWorkorder[] | null {
    return type && this.workordersToDisplay ?
      this.workordersToDisplay.filter((workorder: IntWorkorder) => workorder.workorder.type === type) ?
        this.workordersToDisplay.filter((workorder: IntWorkorder) => workorder.workorder.type === type)
        : null
      : null;
  }
}
