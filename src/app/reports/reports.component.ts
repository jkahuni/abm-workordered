import { Component, OnInit, ViewChild, OnDestroy, ElementRef } from '@angular/core';

// rxjs
import { takeUntil, Subject } from 'rxjs';

// services
import { WorkordersService } from '@workorders/services/workorders.service';

// interfaces
import { IntWorkorder } from '@workorders/models/workorders.models';
import { IntSwitchChart } from '@reports/models/reports.models';
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

  // for changing sections
  factorySections: string[] = ['Grid Casting', 'Sovema',
    'Pasting', 'Jar Formation', 'Assembly Line', 'IGO\'s', 'Acid Plant', 'Hygro Cubicles', 'Tank Formation'];

  initialFactorySections: string[] = ['Grid Casting',
    'Pasting', 'Jar Formation', 'Assembly Line', 'Acid Plant'];

  sections: { name: string, formattedName: string }[] = [];

  // for changing months
  months: { name: string, formatted: string }[] = [
    { name: 'January', formatted: 'Jan 22' },
    { name: 'February', formatted: 'Feb 22' },
    { name: 'March', formatted: 'Mar 22' },
    { name: 'April', formatted: 'Apr 22' },
    { name: 'May', formatted: 'May 22' },
    { name: 'June', formatted: 'Jun 22' },
    { name: 'July', formatted: 'Jul 22' },
    { name: 'August', formatted: 'Aug 22' },
    { name: 'September', formatted: 'Sep 22' },
    { name: 'October', formatted: 'Oct 22' },
    { name: 'November', formatted: 'Nov 22' },
    { name: 'December', formatted: 'Dec 22' },

  ];

  loading = true;

  // in case of errors
  loadingWorkordersFailed = false;
  indexingError!: string;
  otherError!: string;
  fallbackError = `Getting workorders data failed with error code U-Re-01. Please try reloading the page or report the error code to support to have the issue fixed if it persists.`;

  // for one month chart component
  cost!: number;
  month!: string;

  // control child to show
  showSectionsPerMonthChart = true;
  showFourMonthsPeriodChart = false;
  showOneMonthPeriodChart = false;
  showOneWeekPeriodChart = false;

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  ngOnInit(): void {
    this.month = dayjs().format('MMM YY');
    this.sections = this.setFirstFiveSections();
    this.section = this.setInitialRandomSection();
    this.getWorkorders();
  }

  private setFirstFiveSections(): { name: string, formattedName: string }[] {
    let sections: { name: string, formattedName: string }[] = [];


    for (let i = 0; i <= this.factorySections.length; i++) {
      const section = this.factorySections[Math.floor(Math.random() * this.factorySections.length)];

      const formattedSection = this.formatSectionNameAndFormattedName(section);

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

  private formatSectionNameAndFormattedName(section: string): { name: string, formattedName: string } {
    let object: { name: string, formattedName: string };

    if (section) {
      const name = section;
      if (section === 'Grid Casting') {
        const formattedName = 'Casting';
        object = { name, formattedName };
        return object;
      }

      else if (section === 'Sovema'
        || section === 'Pasting'
        || section === 'IGO\'s') {
        const formattedName = section;
        object = { name, formattedName };
        return object;

      }
      else if (section === 'Jar Formation') {
        const formattedName = 'Jar';
        object = { name, formattedName };
        return object;

      } else if (section === 'Assembly Line') {
        const formattedName = 'Assembly';
        object = { name, formattedName };
        return object;

      } else if (section === 'Acid Plant') {
        const formattedName = 'Reactor';
        object = { name, formattedName };
        return object;

      } else if (section === 'Hygro Cubicles') {
        const formattedName = 'Hygros';
        object = { name, formattedName };
        return object;

      } else if (section === 'Tank Formation') {
        const formattedName = 'Tank';
        return object = { name, formattedName };

      }
    }

    return {
      name: '', formattedName: ''
    };
  }

  private setInitialRandomSection(): string {
    const section = this.initialFactorySections[Math.floor(Math.random() * this.initialFactorySections.length)];

    return section;
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
      this.chartPlotted = this.loading = false);
  }

  // show different chart
  switchChart(data: IntSwitchChart): any {
    const type = data['type'];
    this.hideAllChildrenCharts();

    if (type === 'four-months-period') {
      this.showFourMonthsPeriodChart = true;
    } else if (type === 'one-month-period') {
      this.cost = data['cost'] ? data['cost'] : 0;
      this.month = data['month'] ? data['month'] : '';
      this.section = data['section'] ? data['section'] : this.section;
      this.showOneMonthPeriodChart = true;
    }

  }
}
