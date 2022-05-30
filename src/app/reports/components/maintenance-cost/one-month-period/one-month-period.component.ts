import { Component, OnInit, Output, EventEmitter, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { IntSwitchChart } from '@reports/models/reports.models';

// for chart
import { ChartConfiguration, ChartType, Chart } from 'chart.js';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';

// dayjs
import * as dayjs from 'dayjs';
import * as duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

@Component({
  selector: 'app-one-month-period',
  templateUrl: './one-month-period.component.html',
  styleUrls: ['./one-month-period.component.scss']
})
export class OneMonthPeriodComponent implements OnInit, OnChanges, OnDestroy {

  constructor() { }

  @Input('cost') totalCost!: number;
  @Input('section') currentSection!: string;
  @Input('month') selectedMonth!: string;
  @Input('monthsWithYears') monthsWithYearLabels!: string[];

  @Output() switchChart: EventEmitter<IntSwitchChart> = new EventEmitter<IntSwitchChart>();

  cost!: number;
  section!: string;
  month!: string;
  monthsWithYears!: string[];

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.cost = changes['totalCost']?.currentValue !== undefined ? changes['totalCost'].currentValue === 0 ? 0 : changes['totalCost'].currentValue : this.cost;
    this.section = changes['currentSection']?.currentValue ? changes['currentSection'].currentValue : this.section;
    this.month = changes['selectedMonth']?.currentValue !== undefined ? changes['selectedMonth'].currentValue : this.month;
    this.monthsWithYears = changes['monthsWithYearLabels']?.currentValue ? changes['monthsWithYearLabels']?.currentValue : this.monthsWithYears;
    if (this.cost >= 0 && this.section && this.month >= '') {
      this.formatItems();
    }
  }

  ngOnDestroy(): void {

  }

  private getTotalDaysInMonth(): any {
    const monthAndYear = this.monthsWithYears.find((monthYear: string) => {
      return monthYear.slice(0, -4).trim() === this.month.slice(0, -2).trim();
    });
    if (monthAndYear) {
      const monthIndex = dayjs(monthAndYear).month();

      const daysInMonth = dayjs(dayjs().month(monthIndex)).daysInMonth();

      console.log(dayjs(monthAndYear).format(), daysInMonth);
    }
    

  }

  private formatItems(): void {
    const formattedCost = parseFloat((this.cost * 1000000).toLocaleString('en-US', { minimumFractionDigits: 3 }).replace(/,/g, ''));
    this.getTotalDaysInMonth();

  }

  goBack(): void {
    const data: IntSwitchChart = {
      type: 'four-months-period',
      section: ''
    }
    this.switchChart.emit(data);
  }

}
