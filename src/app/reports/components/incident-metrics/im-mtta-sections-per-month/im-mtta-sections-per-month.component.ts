import { Component, OnInit, OnDestroy, Output, Input, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { takeUntil, Subject } from 'rxjs';

import { IntWorkorder } from '@workorders/models/workorders.models';
import * as dayjs from 'dayjs';
import { IntDateIndices, IntNameAndFormattedName } from '@reports/models/reports.models';

// for chart
import { ChartConfiguration, ChartType, Chart } from 'chart.js';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import annotationPlugin from 'chartjs-plugin-annotation';

Chart.register(annotationPlugin);

@Component({
  selector: 'app-im-mtta-sections-per-month',
  templateUrl: './im-mtta-sections-per-month.component.html',
  styleUrls: ['./im-mtta-sections-per-month.component.scss']
})
export class ImMttaSectionsPerMonthComponent implements OnInit, OnDestroy, OnChanges {

  constructor() { }

  private onDestroy: Subject<void> = new Subject<void>();

  @Input('workorders') allWorkorders!: IntWorkorder[];
  @Input('sections') selectedSections!: { name: string, formattedName: string }[];
  @Input('dateIndicesObject') selectedDateIndices!: IntDateIndices;

  @Output() chartPlotted: EventEmitter<boolean> = new EventEmitter<boolean>();

  sections!: IntNameAndFormattedName[];
  workorders!: IntWorkorder[];
  dateIndicesObject!: IntDateIndices;

  formattedDate!: string;

  info!: any;

  // chart
  chart!: Chart;

  loading = true;
  loadingFailed = false;
  loadingDefaultError!: string;
  loadingFallbackError = `Plotting chart failed with error code U-IM-MTTA-SPM-01. Please try reloading the page or report the error code if the issue persists.`;

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const workorders = changes['allWorkorders']?.currentValue;
    const sections = changes['selectedSections']?.currentValue;
    const dateIndicesObject = changes['selectedDateIndices']?.currentValue;

    this.workorders = workorders ? workorders : this.workorders;
    this.sections = sections ? sections : this.sections;
    this.dateIndicesObject = dateIndicesObject ? dateIndicesObject : this.dateIndicesObject;

    if (this.workorders) {
      this.extractWorkorderInformation();
    }
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  private extractWorkorderInformation(): any {
    if (this.workorders.length) {
      let times: any;
      let rates!: any
      let obj: { [key: string]: any } = {};
      const referenceSection: string[] = ['Grid Casting',
        'Jar Formation', 'Acid Plant', 'Assembly Line'];


      referenceSection.forEach(
        (section) => {
          const workorders = this.workorders
            .filter(
              (workorder: IntWorkorder) => {
                return workorder.section.name === section;
              }
            );
            
            const timeTaken = workorders.map(
              (workorder: IntWorkorder) => {
                const raised = dayjs(workorder.raised.dateTime);
                const approved = workorder.approved.status ? dayjs(workorder.approved.dateTime) : null;
                const timeTaken = approved ? approved.diff(raised, 'minutes', true) : 0;
                return timeTaken;
              })
              .reduce(
                (final, initial) => final + initial, 0
            );
          const totalWorkorders = workorders.length;
          const average = Math.ceil(timeTaken / totalWorkorders);

          obj[section] = { timeTaken, totalWorkorders, average};

        }
      );


      this.info = obj;
    }
  }
}
