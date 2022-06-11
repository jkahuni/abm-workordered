import { Component, OnInit } from '@angular/core';
import { takeUntil, Subject } from 'rxjs';


// interfaces
import { IntDateIndices, IntNameAndFormattedName, IntSwitchChart, IntDateRangeLimits } from '@reports/models/reports.models';
import { IntWorkorder } from '@workorders/models/workorders.models';

// services
import { WorkordersService } from '@workorders/services/workorders.service';


import * as dayjs from 'dayjs';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-incident-metrics',
  templateUrl: './incident-metrics.component.html',
  styleUrls: ['./incident-metrics.component.scss']
})
export class IncidentMetricsComponent implements OnInit {

  constructor(
    private workordersService: WorkordersService
  ) { }

  private onDestroy: Subject<void> = new Subject<void>();

  workorders!: IntWorkorder[];

  factorySections: IntNameAndFormattedName[] = [
    { name: 'Grid Casting', formattedName: 'Casting' },
    { name: 'Sovema', formattedName: 'Sovema' },
    { name: 'Pasting', formattedName: 'Pasting' },
    { name: 'Jar Formation', formattedName: 'Jar' },
    { name: 'Assembly Line', formattedName: 'PP Line' },
    { name: 'Acid Plant', formattedName: 'Acid' },
    { name: 'IGO\'s', formattedName: 'IGO\'s' },
    { name: 'Hygro Cubicles', formattedName: 'Hygros' },
    { name: 'Bomaksan Extractor', formattedName: 'Bomaksan' },
    { name: 'Tank Formation', formattedName: 'Tank' }
  ];

  sections: IntNameAndFormattedName[] = [];

  section!: string;

  // changing years
  years: number[] = [];

  // sets current year
  year!: number;

  // for changing months
  months: IntNameAndFormattedName[] = [
    { name: 'January', formattedName: 'Jan' },
    { name: 'February', formattedName: 'Feb' },
    { name: 'March', formattedName: 'Mar' },
    { name: 'April', formattedName: 'Apr' },
    { name: 'May', formattedName: 'May' },
    { name: 'June', formattedName: 'Jun' },
    { name: 'July', formattedName: 'Jul' },
    { name: 'August', formattedName: 'Aug' },
    { name: 'September', formattedName: 'Sep' },
    { name: 'October', formattedName: 'Oct' },
    { name: 'November', formattedName: 'Nov' },
    { name: 'December', formattedName: 'Dec' },

  ];

  // for one month chart component
  // ng model on the same chart
  month!: string;

  // updates both month and year with their index
  dateIndicesObject!: IntDateIndices;

  // viable workorders
  viableWorkorders: string[] = [
    'Corrective Maintenance',
    'Breakdown',
    'AM',
    'PM',
    'Tool Change'
  ];

  loading = true;
  chartPlotted = false;
  loadingWorkordersFailed = false;
  indexingError!: string;
  otherError!: string;
  fallbackError = `Getting workorders data failed with error code U-IM-C-01. Please try reloading the page or report the error code to support to have the issue fixed if it persists.`;

  // for section over a one month period
  useCustomRange = false;

  totalMonthsPeriod = 4;
  totalMonthPeriods: number[] = [4, 6, 9, 12];

  dateRangeLimits!: IntDateRangeLimits;
  defaultYearIndex!: number;
  defaultMonthIndex!: number;

  firstYear!: number;
  firstMonth!: string;
  lastYear!: number;
  lastMonth!: string;
  firstDate!: IntDateIndices;
  lastDate!: IntDateIndices;

  // children category
  chartsType!: string;
  // specific child
  chartType!: string;

  // toggle children to show
  meanTimeToApprove = true;

  // toggle child to show
  showApproveMultipleSectionsOneMonth = true;
  showApproveOneSectionMultipleMonths = false;
  showApproveOneSectionOneMonth = false;

  ngOnInit(): void {
    this.getWorkorders();
    this.setYearsArray();
    this.setCurrentYear();
    this.setCurrentMonth();
    this.setFirstFiveSections();
    this.setInitialRandomSection();
    this.setDateIndicesObject();
    this.updateChartsType();
    this.updateChartType();

  }

  // set current year as default
  private setYearsArray(): number[] {
    let startingYear: number = 2021;
    let currentYear = dayjs().year();
    let years: number[] = [];

    while (startingYear <= currentYear) {
      years.push(startingYear);
      startingYear++;
    }

    return this.years = years;
  }

  private setCurrentYear(): number {
    const currentYear = this.years[this.years.length - 1];
    const fallbackCurrentYear = dayjs().year();

    return this.year = currentYear ? currentYear : fallbackCurrentYear;
  }

  // sets current month as default
  private setCurrentMonth(): string {
    const currentMonth = dayjs().format('MMM');
    return this.month = currentMonth;
  }

  private generateMonthIndex(month: string): number {
    const monthIndex = this.months.findIndex(
      (dateObject: IntNameAndFormattedName) => {
        const name = dateObject['name'];
        const formattedName = dateObject['formattedName'];

        return month === name || month === formattedName;
      }
    );

    return monthIndex !== -1 ? monthIndex : 0;

  }

  private setDateIndicesObject(): IntDateIndices {
    const yearIndex = this.year;
    const monthIndex = this.generateMonthIndex(this.month);
    const dateIndices: IntDateIndices = {
      monthIndex,
      yearIndex
    };


    this.defaultYearIndex = yearIndex;
    this.defaultMonthIndex = monthIndex;


    return this.dateIndicesObject = dateIndices;
  }

  // sets 5 random sections
  private setFirstFiveSections(): IntNameAndFormattedName[] {
    let sections: IntNameAndFormattedName[] = [];


    for (let i = 0; i <= this.factorySections.length; i++) {
      const formattedSection: IntNameAndFormattedName = this.factorySections[Math.floor(Math.random() * this.factorySections.length)];

      const sectionAlreadyAdded = sections.filter(section =>
        section.formattedName === formattedSection['formattedName']
      ).length > 0;

      if (!sectionAlreadyAdded) {
        if (sections.length === 5) {
          break;
        }
        sections.push(formattedSection);
      }
    }

    return this.sections = sections;
  }

  // enables smooth transition
  // to section over four months chart
  // in case no particular section was selected
  // in the sections over one month chart
  private setInitialRandomSection(): string {
    const section: IntNameAndFormattedName = this.factorySections[Math.floor(Math.random() * this.factorySections.length)];

    return this.section = section.name;
  }

  private getWorkorders(): void {
    this.workordersService.$allWorkorders
      .pipe(takeUntil(this.onDestroy))
      .subscribe((workorders: IntWorkorder[] | null) => {
        if (workorders) {
          this.workorders = workorders;
        } else {
          this.workordersService.getAllWorkorders().catch(
            (err: any) => {
              this.loadingWorkordersFailed = true;
              if (err.code === 'failed-precondition') {
                this.indexingError = `Getting workorders data failed with error code IND-Re-01. Please report the error code to support to have the issue fixed if it persists.`;
              } else {
                this.otherError = `Getting workorders data failed with error code O-Re-01. Please try reloading the page or report the error code to support to have the issue fixed if it persists.`;
              }
            }
          );
        }
      });
  }

  private updateChartsType(): string {
    if (this.meanTimeToApprove) {
      return this.chartsType = 'mean-time-to-approve';
    }

    return this.chartsType = '';

  }

  private updateChartType(): string {
    let chartType: string = '';

    if (this.showApproveMultipleSectionsOneMonth) {
      chartType = 'approve-multiple-sections-one-month';
    }

    else if (this.showApproveOneSectionMultipleMonths) {
      chartType = 'approve-one-section-multiple-months';
    }

    else {

      chartType = 'unknown-chart';
    };

    return this.chartType = chartType;
  }

  private disableAllChartsTypes(): void {
    this.meanTimeToApprove = false;
  }

  private hideAllChildrenCharts(): void {
    this.showApproveMultipleSectionsOneMonth = false;
    this.showApproveOneSectionMultipleMonths = false;
    this.showApproveOneSectionOneMonth = false;
  }

  changeChartsType(type: string): void {
    this.disableAllChartsTypes();
    if (type === 'mean-time-to-approve') {
      this.meanTimeToApprove = true;
    }
    this.updateChartsType();
  }


  // change displayed chart through select
  changeChartType(type: string): any {
    this.hideAllChildrenCharts();
    if (type === 'approve-multiple-sections-one-month') {
      this.showApproveMultipleSectionsOneMonth = true;
    }

    else if (type === 'approve-one-section-multiple-months') {
      this.showApproveOneSectionMultipleMonths = true;
    }
    else if (type === 'approve-one-section-one-month') {
      this.showApproveOneSectionOneMonth = true;
    }
    this.updateChartType();
  }


  // update fns
  updateSections(sections: IntNameAndFormattedName[]): IntNameAndFormattedName[] {
    const fallbackSections = [
      { name: 'Grid Casting', formattedName: 'Casting' },
      { name: 'Sovema', formattedName: 'Sovema' },
      { name: 'Pasting', formattedName: 'Pasting' },
      { name: 'Jar Formation', formattedName: 'Jar' },
      { name: 'Assembly Line', formattedName: 'PP Line' },
    ];
    return this.sections = sections ? sections : fallbackSections;
  }

  updateSection(section: string): string {
    const fallbackSection = 'Grid Casting';
    return this.section = section ? section : fallbackSection;
  }

  updateYear(year: number): void {
    const fallbackYear = dayjs().year();
    this.year = year ? year : fallbackYear;
    this.setDateIndicesObject();
  }

  // update week to display
  updateMonth(month: string): void {
    const fallbackMonth = dayjs().format('MMM');
    this.month = month ? month : fallbackMonth;
    this.setDateIndicesObject();
  }

  // For one section multiple months
  updateUseCustomRange(event: MatSlideToggleChange): boolean {
    const emptyIndices: IntDateIndices = { monthIndex: 0, yearIndex: dayjs().year() };
    const resetDateRangeLimits: IntDateRangeLimits = {
      firstDate: emptyIndices,
      lastDate: emptyIndices,
      limitsUpdated: false
    };

    return this.useCustomRange = event.checked ? true : false;

  }

  // output from child component
  // updates the ng-models on template
  updateDateRangeLimitsFromChild(dateLimits: IntDateRangeLimits): any {

    const firstDate: IntDateIndices = dateLimits['firstDate'];
    const lastDate: IntDateIndices = dateLimits['lastDate'];

    const firstYearIndex = firstDate['yearIndex'];
    const firstMonthIndex = firstDate['monthIndex'];
    const firstMonthString = dayjs().year(firstYearIndex).month(firstMonthIndex).format('MMM');

    const lastYearIndex = lastDate['yearIndex'];
    const lastMonthIndex = lastDate['monthIndex'];
    const lastMonthString = dayjs().year(lastYearIndex).month(lastMonthIndex).format('MMM');

    // update values
    setTimeout(() => {
      this.firstYear = firstYearIndex;
      this.firstMonth = firstMonthString;

      this.lastYear = lastYearIndex;
      this.lastMonth = lastMonthString;
    });
  }

  updateChildsDateRangeLimits({ firstDate, lastDate }: { firstDate: IntDateIndices, lastDate: IntDateIndices }): any {
    const dateRangeLimits: IntDateRangeLimits = {
      firstDate,
      lastDate,
      limitsUpdated: true
    };

    return this.dateRangeLimits = dateRangeLimits;
  }

  // updates single portions of the dateRangeLimits
  updateDateRangeLimitParts(data: string | number, type: string): void {
    let firstYearIndex: number = this.firstYear;
    let firstMonthIndex: number = this.generateMonthIndex(this.firstMonth);
    let lastYearIndex: number = this.lastYear;
    let lastMonthIndex: number = this.generateMonthIndex(this.lastMonth);

    if (type === 'first-year') {
      firstYearIndex = Number(data);
    }

    else if (type === 'first-month') {
      firstMonthIndex = this.generateMonthIndex(String(data));
    }

    else if (type === 'last-year') {
      lastYearIndex = Number(data);
    }

    else if (type === 'last-month') {
      lastMonthIndex = this.generateMonthIndex(String(data));
    }

    const firstDate: IntDateIndices = {
      yearIndex: firstYearIndex,
      monthIndex: firstMonthIndex
    };
    const lastDate: IntDateIndices = {
      yearIndex: lastYearIndex,
      monthIndex: lastMonthIndex
    };

    this.updateChildsDateRangeLimits({ firstDate, lastDate });
  }

  // updates total sections to plot over
  updateTotalMonthsPeriod(totalMonthsPeriod: number): number {
    const fallbackTotalMonthsPeriod = 4;
    return this.totalMonthsPeriod = totalMonthsPeriod ? totalMonthsPeriod : fallbackTotalMonthsPeriod;
  }

  // emitted from different components
  updateChartPlottedStatus(status: boolean): boolean {
    return status ? (
      this.chartPlotted = true,
      this.loading = false
    ) : (
      this.chartPlotted = false,
      this.loading = false
    )
  }

  // switch chart
  switchChart(newChartData: IntSwitchChart): void {
    const type = newChartData['type'];
    const section = newChartData['section'];
    const month = newChartData['month'];

    month ? this.updateMonth(month) : (null);
    section ? this.updateSection(section) : (null);

    this.changeChartType(type);
  }
}  
