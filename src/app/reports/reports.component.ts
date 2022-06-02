import { Component, OnInit, ViewChild, OnDestroy, ElementRef } from '@angular/core';

// rxjs
import { takeUntil, Subject } from 'rxjs';

// services
import { WorkordersService } from '@workorders/services/workorders.service';

// interfaces
import { IntWorkorder } from '@workorders/models/workorders.models';
import { IntSwitchChart, IntNameAndFormattedName  } from '@reports/models/reports.models';
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
  ) { }

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
  showSectionsPerMonthChart = true;
  showFourMonthsPeriodChart = false;
  showOneMonthPeriodChart = false;
  showOneWeekPeriodChart = false;


  factorySections: IntNameAndFormattedName [] = [
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
  sections: IntNameAndFormattedName [] = [];

  // ng model for chart types
  chartType!: string;

  // for changing months
  months: IntNameAndFormattedName[] = [
    { name: 'January', formattedName : 'Jan 22' },
    { name: 'February', formattedName : 'Feb 22' },
    { name: 'March', formattedName : 'Mar 22' },
    { name: 'April', formattedName : 'Apr 22' },
    { name: 'May', formattedName : 'May 22' },
    { name: 'June', formattedName : 'Jun 22' },
    { name: 'July', formattedName : 'Jul 22' },
    { name: 'August', formattedName : 'Aug 22' },
    { name: 'September', formattedName : 'Sep 22' },
    { name: 'October', formattedName : 'Oct 22' },
    { name: 'November', formattedName : 'Nov 22' },
    { name: 'December', formattedName : 'Dec 22' },

  ];

  // for one month chart component
  // ng model on the same chart
  month!: string;


  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  ngOnInit(): void {
    this.month = dayjs().format('MMM YY');
    this.sections = this.setFirstFiveSections();
    this.section = this.setInitialRandomSection();
    this.setChartType();
    this.getWorkorders();
  }

  // set chart type ng model value
  private setChartType(): string {
    if (this.showSectionsPerMonthChart) {
      return this.chartType = 'sections-one-month';
     }

    else if (this.showFourMonthsPeriodChart) { 
      return this.chartType = 'section-four-months-period';
    }

    else if (this.showOneMonthPeriodChart) { 
      return this.chartType = 'section-one-month-period';
    }

    else if (this.showOneWeekPeriodChart) { 
      return this.chartType = 'section-one-week-period';
    }

    else {
      return this.chartType = 'unknown chart';
    }
  
  }

  // sets 5 random sections
  private setFirstFiveSections(): IntNameAndFormattedName [] {
    let sections: IntNameAndFormattedName [] = [];


    for (let i = 0; i <= this.factorySections.length; i++) {
      const formattedSection: IntNameAndFormattedName  = this.factorySections[Math.floor(Math.random() * this.factorySections.length)];

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

    return sections;
  }

  // enables smooth transition
  // to section over four months chart
  // in case no particular section was selected
  // in the sections over one month chart
  private setInitialRandomSection(): string {
    const section: IntNameAndFormattedName  = this.factorySections[Math.floor(Math.random() * this.factorySections.length)];

    return section.name;
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
    this.showFourMonthsPeriodChart = false;
    this.showOneMonthPeriodChart = false;
    this.showOneWeekPeriodChart = false;
    this.showSectionsPerMonthChart = false
  }

  // changes chart displayed
  changeDisplayedChart(type: string): any {
    this.hideAllChildrenCharts();
    if (type === 'sections-one-month') {
      this.showSectionsPerMonthChart = true;
    }
    else if (type === 'section-four-months-period') {
      this.showFourMonthsPeriodChart = true;
    }
    else if (type === 'section-one-month-period') {
      this.showOneMonthPeriodChart = true;
    }
    else if (type === 'section-one-week-period') {
      this.showOneWeekPeriodChart = true;
    }
    this.setChartType();

  }

  // update sections to display
  // on sections per month chart
  updateSectionsToDisplay(sections: IntNameAndFormattedName []): any {
    this.sections = sections;
  }

  // update section to display
  updateSectionToDisplay(section: string): string {
    return this.section = section ? section : '';
  }

  // update week to display
  updateMonthToDisplay(month: string): string {
    return this.month = month ? month : '';
  }

  // emitted from different components
  updateChartPlotted(status: boolean): boolean {
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
    this.hideAllChildrenCharts();

    if (type === 'four-months-period') {
      this.showFourMonthsPeriodChart = true;
    } else if (type === 'one-month-period') {
      this.month = data['month'] ? data['month'] : '';
      this.section = data['section'] ? data['section'] : this.section;
      this.showOneMonthPeriodChart = true;
    }

  }
}
