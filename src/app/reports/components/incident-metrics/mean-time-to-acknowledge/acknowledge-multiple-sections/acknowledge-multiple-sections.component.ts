import { Component, OnInit, OnDestroy, Output, Input, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { takeUntil, Subject } from 'rxjs';

import { IntWorkorder } from '@workorders/models/workorders.models';
import * as dayjs from 'dayjs';
import { IntDateIndices, IntNameAndFormattedName, IntSwitchChart } from '@reports/models/reports.models';

// for chart
import { ChartConfiguration, ChartType, Chart } from 'chart.js';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import annotationPlugin from 'chartjs-plugin-annotation';


@Component({
  selector: 'app-acknowledge-multiple-sections',
  templateUrl: './acknowledge-multiple-sections.component.html',
  styleUrls: ['./acknowledge-multiple-sections.component.scss']
})
export class AcknowledgeMultipleSectionsComponent implements OnInit, OnChanges, OnDestroy {

  @Input('workorders') allWorkorders!: IntWorkorder[];
  @Input('sections') selectedSections!: { name: string, formattedName: string }[];
  @Input('dateIndicesObject') selectedDateIndices!: IntDateIndices;
  @Input('viableWorkorders') workorderTypes!: string[];

  @Output() chartPlotted: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() switchChart: EventEmitter<IntSwitchChart> = new EventEmitter<IntSwitchChart>();

  private onDestroy: Subject<void> = new Subject<void>();
  private updateChartPlotted: Subject<boolean> = new Subject<boolean>();

  sections!: IntNameAndFormattedName[];
  workorders!: IntWorkorder[];
  dateIndicesObject!: IntDateIndices;

  // workorders to work on
  viableWorkorders!: string[];

  formattedDate!: string;

  info!: any;

  // chart
  chart!: Chart;

  loading = true;
  loadingFailed = false;
  loadingDefaultError!: string;
  loadingFallbackError = `Plotting chart failed with error code U-IM-MTTAc-MS-01. Please try reloading the page or report the error code if the issue persists.`;


  constructor() {
    this.updateChartPlotted
      .pipe(takeUntil(this.onDestroy))
      .subscribe((status: boolean) => setTimeout(() => {
        this.chartPlotted.emit(status);
        setTimeout(() => {
          this.loading = false;
        }, 10)
        if (!status) {
          this.loadingFailed = true;
        }
      }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    const workorders = changes['allWorkorders']?.currentValue;
    const sections = changes['selectedSections']?.currentValue;
    const dateIndicesObject = changes['selectedDateIndices']?.currentValue;
    const viableWorkorders = changes['workorderTypes']?.currentValue;

    this.workorders = workorders ? workorders : this.workorders;
    this.sections = sections ? sections : this.sections;
    this.dateIndicesObject = dateIndicesObject ? dateIndicesObject : this.dateIndicesObject;
    this.viableWorkorders = viableWorkorders ? viableWorkorders : this.viableWorkorders;

    if (this.workorders) {
      this.generateChartDataAndChart();
    }
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  private generateFormattedTitleDate(): string {
    const monthIndex = this.dateIndicesObject['monthIndex'];
    const yearIndex = this.dateIndicesObject['yearIndex'];

    const formattedDate = dayjs().year(yearIndex).month(monthIndex).format('MMMM YYYY');

    return this.formattedDate = formattedDate;
  }

  private filterWorkorders(section: string): number[] {
    const year = this.dateIndicesObject['yearIndex'];
    const month = this.dateIndicesObject['monthIndex'];

    let totalTimeArray: number[] = [];

    for (let workorder of this.workorders) {
      const workorderSection = workorder.section.name;

      const raised = dayjs(workorder.raised.dateTime);

      const acknowledged = workorder.acknowledged.status;

      const workorderType = workorder.workorder.type;

      const workorderIsViable = this.viableWorkorders.includes(workorderType);

      if (workorderIsViable &&
        acknowledged &&
        workorderSection === section &&
        raised.year() === year &&
        raised.month() === month) {
        const acknowledgedTime = dayjs(workorder.acknowledged.dateTime);

        const timeDifference = acknowledgedTime.diff(raised, 'minutes');

        totalTimeArray.push(timeDifference);
      }
    }

    return totalTimeArray;
  }

  private createChart(labels: string[], acknowledgementRatesArray: number[]): Chart {
    const type: ChartType = 'bar';

    const data: ChartConfiguration['data'] = {
      labels,
      datasets: [
        {
          data: acknowledgementRatesArray,
          borderWidth: 1,
          backgroundColor: 'rgba(77,83,96,0.2)',
          borderColor: 'rgba(77,83,96,1)',
          pointBackgroundColor: 'rgba(77,83,96,1)',
          pointBorderColor: '#fff',
          pointRadius: 5,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(77,83,96,1)',
          fill: 'origin',
        }
      ]
    };

    const maximumMean = Math.max(...acknowledgementRatesArray);

    Chart.defaults.font.family = 'Lato, "Open Sans", Arial, Helvetica, Noto, "Lucida Sans", sans-serif';
    Chart.defaults.font.size = 14;
    Chart.defaults.font.lineHeight = 1.4;
    Chart.register(annotationPlugin, DataLabelsPlugin);

    const chart = new Chart('acknowledgeMultipleSections', {
      type,
      data,
      // plugins: [DataLabelsPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,

        scales: {
          x: {
            grid: {
              display: false,
              tickColor: 'black'
            },
            ticks: {
              color: 'black',
            },
            title: {
              color: 'black',
              display: true,
              text: 'Sections'
            }
          },
          y: {
            grid: {
              display: false,
              tickColor: 'black'
            },
            ticks: {
              color: 'black',
            },
            title: {
              color: 'black',
              display: true,
              text: 'Minutes',
              // font: {
              //   family: 'Lato, "Open Sans", sans-serif'
              // }
            },

            suggestedMin: 0,
            suggestedMax: maximumMean * 1.2,
            beginAtZero: true,

          }
        },

        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: [
              'Mean Time To Acknowledge',
              this.formattedDate
            ]
          },
          datalabels: {
            display: 'auto',
            anchor: 'end',

            align: 'end',

            textAlign: 'center',

            formatter: (value) => {
              if (+value === 0) { return 'N/A' }
              const formattedValue = value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
              return formattedValue;

            },
            color: 'black',
            offset: 0

          },

          // annotation: {
          //   annotations: [
          //     {
          //       type: 'line',
          //       scaleID: 'y',
          //       value: '10',
          //       // yMin: '2',
          //       // yMax: '2',
          //       borderColor: 'rgba(0,0,0,0.4)',
          //       borderWidth: 1,
          //       label: {
          //         position: 'end',
          //         enabled: true,
          //         color: 'white',
          //         content: 'Max Allowed Time',
          //         yAdjust: 0,
          //         backgroundColor: 'rgba(0,0,0,0.2)',

          //       }
          //     },
          //   ],
          // }
        },

        // interaction.mode default = 'nearest'
        interaction: {
          mode: 'nearest',
          axis: 'y'
        },

        events: ['click'],

        onClick: (event) => {
          const points = chart.getElementsAtEventForMode(event as unknown as Event, 'nearest', { intersect: true }, false);
          if (points.length) {
            const point = points[0];
            if (point) {
              const section = chart.data.labels?.[point.index] as string;
              this.switchToSectionMultipleMonths(section);
            }
          }

        }
      }
    });

    return chart;

  }

  private generateChartDataAndChart(): void {
    if (this.workorders.length) {
      this.generateFormattedTitleDate();
      let sectionLabels: string[] = [];
      let acknowledgementRates: number[] = [];


      this.sections.forEach(
        (section: IntNameAndFormattedName) => {
          const sectionName = section['name'];
          const sectionFormattedName = section['formattedName'];

          const workordersTimeArray: number[] = this.filterWorkorders(sectionName);

          const totalWorkorders: number = workordersTimeArray.length;
          const totalTime: number = workordersTimeArray.reduce(
            (finalTime: number, initialTime) => finalTime + initialTime, 0
          );

          const acknowledgementRate: number = this.calculateAcknowledgementRate({ totalWorkorders, totalTime });

          sectionLabels.push(sectionFormattedName);
          acknowledgementRates.push(acknowledgementRate);
        }
      );

      if (this.chart) {
        this.chart.destroy();
      }

      this.chart = this.createChart(sectionLabels, acknowledgementRates);

      if (this.chart) {
        this.updateChartPlotted.next(true);
      }

    } else {
      this.updateChartPlotted.next(false);
      this.loadingDefaultError = `No Data found. Please try reloading the page or confirm there is available data in the home page.`;
    }
  }

  private calculateAcknowledgementRate({ totalTime, totalWorkorders }: { totalTime: number, totalWorkorders: number }): number {
    let rate = totalTime / totalWorkorders;
    if (isNaN(rate)) {
      rate = 0;
    }

    return rate;
  }

  private switchToSectionMultipleMonths(formattedSectionName: string): void {

    const section = this.sections.filter((section: IntNameAndFormattedName) =>
      section.formattedName === formattedSectionName
    ).map((section: IntNameAndFormattedName) =>
      section.name)
      .reduce((final, initial) => initial);

    const switchChartData = {
      type: 'section-multiple-months',
      section
    };

    this.switchChart.emit(switchChartData);

  }

}
