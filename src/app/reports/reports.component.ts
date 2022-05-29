import { Component, OnInit, ViewChild, OnDestroy, ElementRef } from '@angular/core';

// rxjs
import { takeUntil, Subject } from 'rxjs';

// services
import { WorkordersService } from '@workorders/services/workorders.service';

// interfaces
import { IntWorkorder } from '@workorders/models/workorders.models';



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


  factorySections: string[] = ['Grid Casting', 'Sovema',
    'Pasting', 'Jar Formation', 'Assembly Line', 'IGO\'s', 'Acid Plant', 'Hygro Cubicles', 'Tank Formation'];

  initialFactorySections: string[] = ['Grid Casting',
    'Pasting', 'Jar Formation', 'Assembly Line', 'Acid Plant'];

  // in case of errors
  loadingWorkordersFailed = false;
  indexingError!: string;
  otherError!: string;
  fallbackError = `Getting workorders data failed with error code U-Re-01. Please try reloading the page or report the error code to support to have the issue fixed if it persists.`;


  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  ngOnInit(): void {
    this.section = this.setInitialRandomSection();
    this.getWorkorders();
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

  // update section to display
  updateSectionToDisplay(section: string): string {
    return this.section = section ? section : '';
  }

  // emitted from different components
  updateChartPlotted(status: boolean): boolean {
    return this.chartPlotted = status ? true : false;
  }
}
