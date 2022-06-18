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

  sections: IntNameAndFormattedName[] = [
    { name: 'Grid Casting', formattedName: 'Casting' },
    { name: 'Pasting', formattedName: 'Pasting' }
  ];

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

  // for one week chart
  week!: string;
  weeks!: string[];

  // children category
  chartsType!: string;
  // specific child
  chartType!: string;

  // toggle children to show
  meanTimeToApprove = false;
  meanTimeToAcknowledge = false;
  meanTimeToRepair = false;
  meanTimeBeforeFailure = false;

  // toggle child to show
  multipleSections = false;
  sectionMultipleMonths = false;
  sectionOneMonth = false;
  sectionOneWeek = false;

  constructor(
    private workordersService: WorkordersService
  ) { }


  ngOnInit(): void {
    this.setInitialChartsAndChart();
    this.getWorkorders();
    this.setYearsArray();
    this.setCurrentYear();
    this.setCurrentMonth();
    // this.setFirstFiveSections();
    this.setInitialRandomSection();
    this.setDateIndicesObject();
    this.setInitialWeekAndWeeks();
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


    // updates defaults on one section multiple months
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
    const section: IntNameAndFormattedName = this.sections[Math.floor(Math.random() * this.sections.length)];

    return this.section = section.name;
  }

  private setInitialWeekAndWeeks(): void {
    this.week = 'Week 1';

    let defaultTotalWeeks = 5;
    let weeks: string[] = [];

    for (let i = 1; i <= defaultTotalWeeks; i++) {
      weeks.push(`Week ${i}`);

    }

    this.weeks = weeks;
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

  private hideAllChildrenCharts(): void {
    this.multipleSections = false
    this.sectionMultipleMonths = false;
    this.sectionOneMonth = false;
    this.sectionOneWeek = false;
    this.useCustomRange = false;
  }

  private hideAllChartsTypes(): void {
    this.meanTimeToApprove = false;
    this.meanTimeToAcknowledge = false;
    this.meanTimeToRepair = false;
    this.meanTimeBeforeFailure = false;
  }

  private setInitialChartsAndChart(): void {
    this.meanTimeToApprove = true;
    this.multipleSections = true;
    this.chartsType = 'mean-time-to-approve';
    this.chartType = 'multiple-sections';
  }

  private setDefaultsForNewChartsType(): void {
    this.hideAllChildrenCharts();
    this.multipleSections = true;
    this.chartType = 'multiple-sections';

  }

  changeChartsType(type: string): string  {
    this.loading = true;
    this.hideAllChartsTypes();

    if (type === 'mean-time-to-approve') {
      this.meanTimeToApprove = true;
    }

    else if (type === 'mean-time-to-acknowledge') {
      this.meanTimeToAcknowledge = true;
    }
    else if (type === 'mean-time-to-repair') {
      this.meanTimeToRepair = true;
    }
    else if (type === 'mean-time-before-failure') {
      this.meanTimeBeforeFailure = true;
    }

    this.chartsType = type;
    this.setDefaultsForNewChartsType();
    return this.chartsType;
  }

  // change displayed chart through select
  // and through interacting with chart data points
  changeChartType(type: string): string {
    this.hideAllChildrenCharts();

    if (type === 'multiple-sections') {
      this.multipleSections = true;
    }

    else if (type === 'section-multiple-months') {
      this.sectionMultipleMonths = true;
    }

    else if (type === 'section-one-month') {
      this.sectionOneMonth = true;
    }

    else if (type === 'section-one-week') {
      this.sectionOneWeek = true;
    }
    return this.chartType = type;

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

  updateYear(year: number): number {
    const fallbackYear = dayjs().year();
    this.year = year ? year : fallbackYear;
    this.setDateIndicesObject();
    return this.year;
  }

  // update week to display
  updateMonth(month: string): string {
    const fallbackMonth = dayjs().format('MMM');
    this.month = month ? month : fallbackMonth;
    this.setDateIndicesObject();
    return this.month;
  }

  updateWeek(week: string): string {
    const fallbackWeek = 'Week 1';
    this.week = week ? week : fallbackWeek;

    return this.week;
  }

  // enables smooth transition from
  // EX: months that have 5 weeks to those with 4
  private conditionallyUpdateWeek(): void {
    if (this.week && this.weeks) {
      const weekPresent = this.weeks.includes(this.week);
      if (!weekPresent) {
        this.week = this.weeks[this.weeks.length - 1];
      }
    }
  }

  updateWeeks(weeks: string[]): string[] {
    this.weeks = weeks;
    this.conditionallyUpdateWeek();
    return this.weeks;
  }

  // For one section multiple months
  updateUseCustomRange(event: MatSlideToggleChange): any {
    return event.checked ? (
      this.useCustomRange = true
    ) 
      :
      (
      this.useCustomRange = false,
      this.totalMonthsPeriod = 4,
      this.setDateIndicesObject()
    );

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
    // this.loading = true;
    const type = newChartData['type'];
    const section = newChartData['section'];
    const month = newChartData['month'];
    const week = newChartData['week'];
    const weeks = newChartData['weeks'];

    month ? this.updateMonth(month) : null;
    section ? this.updateSection(section) : null;
    week ? this.updateWeek(week) : null;
    weeks ? this.updateWeeks(weeks) : null;


    this.changeChartType(type);
  }
}  
