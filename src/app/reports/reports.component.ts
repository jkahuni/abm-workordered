import { Component, OnInit, ViewChild, OnDestroy, ElementRef } from '@angular/core';

// rxjs
import { takeUntil, Subject } from 'rxjs';

// services
import { WorkordersService } from '@workorders/services/workorders.service';

// interfaces
import { IntWorkorder } from '@workorders/models/workorders.models';
import { IntSwitchChart, IntNameAndFormattedName, IntDateIndices } from '@reports/models/reports.models';
// dayjs
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, OnDestroy {

  constructor(
    private workordersService: WorkordersService
  ) {
  }

  private onDestroy: Subject<void> = new Subject<void>();

  @ViewChild('loadingSpinner') loadingSpinner!: ElementRef;

  section!: string;
  workorders!: IntWorkorder[];
  chartPlotted = false;

  // controls bootstrap spinner
  loading = true;

  // handle errors
  loadingWorkordersFailed = false;
  indexingError!: string;
  otherError!: string;
  fallbackError = `Getting workorders data failed with error code U-Re-01. Please try reloading the page or report the error code to support to have the issue fixed if it persists.`;

  // control child component to show
  showMultipleSectionsOneMonthChart = true;
  showOneSectionMultipleMonthsPeriodChart = false;
  showOneSectionOneMonthPeriodChart = false;
  showOneSectionOneWeekPeriodChart = false;


  factorySections: IntNameAndFormattedName[] = [
    { name: 'Grid Casting', formattedName: 'Casting' },
    { name: 'Sovema', formattedName: 'Sovema' },
    { name: 'Pasting', formattedName: 'Pasting' },
    { name: 'Jar Formation', formattedName: 'Jar' },
    { name: 'Assembly Line', formattedName: 'PP Line' },
    { name: 'IGO\'s', formattedName: 'IGO\'s' },
    { name: 'Acid Plant', formattedName: 'Acid' },
    { name: 'Hygro Cubicles', formattedName: 'Hygros' },
    { name: 'Tank Formation', formattedName: 'Tank' }
  ];

  // ng model on sections one month chart
  sections: IntNameAndFormattedName[] = [];

  // ng model for chart types
  chartType!: string;

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

  // total months when showing multiple months chart
  totalMonthPeriods: number[] = [4, 6, 9, 12];
  totalMonthsPeriod = 4;

  // updates both month and year with their index
  dateIndicesObject!: IntDateIndices;


  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  ngOnInit(): void {
    this.setYearsArray();
    this.setCurrentYear();
    this.setCurrentMonth();

    this.setFirstFiveSections();
    this.setInitialRandomSection();
    this.setChartType();
    this.getWorkorders();

    // sets default dateIndices
    this.setDateIndicesObject();

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

  private setMonthIndex(month: string): number {
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
    const monthIndex = this.setMonthIndex(this.month);
    const dateIndices: IntDateIndices = {
      monthIndex,
      yearIndex
    };
    return this.dateIndicesObject = dateIndices;
  }

  // set chart type ng model value
  private setChartType(): string {
    if (this.showMultipleSectionsOneMonthChart) {
      return this.chartType = 'sections-one-month-chart';
    }

    else if (this.showOneSectionMultipleMonthsPeriodChart) {
      return this.chartType = 'one-section-multiple-months-period';
    }

    else if (this.showOneSectionOneMonthPeriodChart) {
      return this.chartType = 'one-section-one-month-period';
    }

    else if (this.showOneSectionOneWeekPeriodChart) {
      return this.chartType = 'one-section-one-week-period';
    }

    else {
      return this.chartType = 'unknown chart';
    }

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

  private hideAllChildrenCharts(): void {
    this.showOneSectionMultipleMonthsPeriodChart = false;
    this.showOneSectionOneMonthPeriodChart = false;
    this.showOneSectionOneWeekPeriodChart = false;
    this.showMultipleSectionsOneMonthChart = false
  }

  // changes chart displayed
  changeDisplayedChart(type: string): any {
    this.hideAllChildrenCharts();
    if (type === 'sections-one-month-chart') {
      this.showMultipleSectionsOneMonthChart = true;
    }
    else if (type === 'one-section-multiple-months-period') {
      this.showOneSectionMultipleMonthsPeriodChart = true;
    }
    else if (type === 'one-section-one-month-period') {
      this.showOneSectionOneMonthPeriodChart = true;
    }
    else if (type === 'one-section-one-week-period') {
      this.showOneSectionOneWeekPeriodChart = true;
    }
    this.setChartType();

  }

  // update sections to display
  // on sections per month chart
  updateSections(sections: IntNameAndFormattedName[]): any {
    const fallbackSections = [
      { name: 'Grid Casting', formattedName: 'Casting' },
      { name: 'Sovema', formattedName: 'Sovema' },
      { name: 'Pasting', formattedName: 'Pasting' },
      { name: 'Jar Formation', formattedName: 'Jar' },
      { name: 'Assembly Line', formattedName: 'PP Line' },
    ];
    this.sections = sections ? sections : fallbackSections;
  }

  // update section to display
  updateSection(section: string): string {
    const fallbackSection = 'Grid Casting';
    return this.section = section ? section : fallbackSection;
  }

  // updates total sections to plot over
  updateTotalMonthsPeriod(totalMonthsPeriod: number): number {
    const fallbackTotalMonthsPeriod = 3;
    return this.totalMonthsPeriod = totalMonthsPeriod ? totalMonthsPeriod : fallbackTotalMonthsPeriod;
  }

  // updates selected year
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

  // emitted from different components
  updateChartPlottedStatus(status: boolean): boolean {
    return status ? (
      this.chartPlotted = true,
      this.loading = false
    ) : (
      this.chartPlotted = false),
      this.loading = false;
  }

  // show different chart
  switchChart(data: IntSwitchChart): any {
    const type = data['type'];
    const section = data['section'];
    const month = data['month'];
    this.section = section ? section : this.section;
    month ? (
      this.month = month,
      this.setDateIndicesObject()
    ) : (null);

    this.changeDisplayedChart(type);


  }
}
