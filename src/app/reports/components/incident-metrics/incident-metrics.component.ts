import { Component, OnInit } from '@angular/core';
import { IntDateIndices, IntNameAndFormattedName } from '@reports/models/reports.models';
import { IntWorkorder } from '@workorders/models/workorders.models';
import { WorkordersService } from '@workorders/services/workorders.service';
import * as dayjs from 'dayjs';
import { takeUntil, Subject } from 'rxjs';

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

  defaultYearIndex!: number;
  defaultMonthIndex!: number;

  loading = true;
  chartPlotted = false;
  loadingWorkordersFailed = false;
  indexingError!: string;
  otherError!: string;
  fallbackError = `Getting workorders data failed with error code U-IM-C-01. Please try reloading the page or report the error code to support to have the issue fixed if it persists.`;

  useCustomRange = false;

  // children category
  chartsType!: string;
  // specific child
  chartType!: string;

  // toggle children to show
  meanTimeToApprove = true;

  // toggle child to show
  showApproveMultipleSectionsOneMonth = true;

  ngOnInit(): void {
    this.getWorkorders();
    this.setYearsArray();
    this.setCurrentYear();
    this.setCurrentMonth();
    this.setFirstFiveSections();
    this.setInitialRandomSection();
    this.setDateIndicesObject();
    this.setChartsType();
    this.setChartType();

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

  private updateMonthAndYearDefaults(): any {
    const yearIndex = this.year;
    const monthIndex = this.generateMonthIndex(this.month);

    this.defaultYearIndex = yearIndex;
    this.defaultMonthIndex = monthIndex;
  }

  private setChartType(): string {
    if (this.showApproveMultipleSectionsOneMonth) {
      return this.chartType = 'approve-multiple-sections-one-month';
    }

    return this.chartType = 'unknown-chart';
  }

  private setChartsType(): string {
    if (this.meanTimeToApprove) {
      return this.chartsType = 'mean-time-to-approve';
    }

    return this.chartsType = '';

  }

  private disableAllChartsTypes(): void {
    this.meanTimeToApprove = false;
  }

  private hideAllChildrenCharts(): void {
    this.showApproveMultipleSectionsOneMonth = false;
  }

  changeChartsType(type: string): void {
    this.disableAllChartsTypes();
    if (type === 'mean-time-to-approve') {
      this.meanTimeToApprove = true;
    }
    this.setChartsType();
  }


  // change displayed chart through select
  changeChartType(type: string): any {
    this.hideAllChildrenCharts();
    if (type === 'approve-multiple-sections-one-month') {
      this.showApproveMultipleSectionsOneMonth = true;
    }
    this.setChartType();
    console.log('new chart', type);
  }


  // update fns
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

  updateYear(year: number): void {
    const fallbackYear = dayjs().year();
    this.year = year ? year : fallbackYear;
    this.setDateIndicesObject();
    this.updateMonthAndYearDefaults();
  }

  // update week to display
  updateMonth(month: string): void {
    const fallbackMonth = dayjs().format('MMM');
    this.month = month ? month : fallbackMonth;
    this.setDateIndicesObject();
    this.updateMonthAndYearDefaults();
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

}
