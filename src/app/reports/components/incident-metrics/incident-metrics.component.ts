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
    { name: 'IGO\'s', formattedName: 'IGO\'s' },
    { name: 'Acid Plant', formattedName: 'Acid' },
    { name: 'Hygro Cubicles', formattedName: 'Hygros' },
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



  loading = true;
  loadingWorkordersFailed = false;
  indexingError!: string;
  otherError!: string;


  ngOnInit(): void {
    this.setYearsArray();
    this.setCurrentYear();
    this.setCurrentMonth();
    this.setFirstFiveSections();
    this.setInitialRandomSection();
    this.setDateIndicesObject();


    this.getWorkorders();
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

}
