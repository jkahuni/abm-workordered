import { Component, OnInit, Output, EventEmitter, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

// interfaces
import { IntSwitchChart, IntDateIndices } from '@reports/models/reports.models';
import { IntWorkorder } from '@workorders/models/workorders.models';

// rxjs
import { takeUntil, Subject } from 'rxjs';


// for chart
import { ChartConfiguration, ChartType, Chart } from 'chart.js';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';

// dayjs
import * as dayjs from 'dayjs';


@Component({
  selector: 'app-mc-one-section-one-week-period',
  templateUrl: './mc-one-section-one-week-period.component.html',
  styleUrls: ['./mc-one-section-one-week-period.component.scss']
})
export class McOneSectionOneWeekPeriodComponent implements OnInit, OnChanges, OnDestroy {

  constructor() { }
  

  private onDestroy = new Subject<void>();
  private updateChartPlotted: Subject<boolean> = new Subject<boolean>();


  section!: string;
  month!: string;
  week!: string;
  workorders!: IntWorkorder[];
  dateIndicesObject!: IntDateIndices;

  // chart
  chart!: Chart;

  loading = true;
  loadingFailed = false;
  loadingDefaultError!: string;
  loadingFallbackError = `Plotting chart failed with error code U-MC-OWP-01. Please try reloading the page or report the error code if the issue persists.`;


  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    throw new Error('Method not implemented.');
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

}
