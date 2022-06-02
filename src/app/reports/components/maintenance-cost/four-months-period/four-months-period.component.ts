import { Component, OnDestroy, OnInit, Input, OnChanges, Output, SimpleChanges, EventEmitter } from '@angular/core';

// rxjs
import { takeUntil, Subject } from 'rxjs';

// interfaces
import { IntWorkorder } from '@workorders/models/workorders.models';
import { IntSwitchChart } from '@reports/models/reports.models';


// for chart
import { ChartConfiguration, ChartType, Chart } from 'chart.js';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';

// dayjs
import * as dayjs from 'dayjs';
import * as duration from 'dayjs/plugin/duration';
dayjs.extend(duration);


@Component({
  selector: 'app-four-months-period',
  templateUrl: './four-months-period.component.html',
  styleUrls: ['./four-months-period.component.scss']
})
export class FourMonthsPeriodComponent implements OnInit, OnDestroy, OnChanges {

  constructor(
  ) {
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

  @Input('workorders') allWorkorders!: IntWorkorder[];
  @Input('section') currentSection!: string;

  @Output() chartPlotted: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() switchChart: EventEmitter<IntSwitchChart> = new EventEmitter<IntSwitchChart>();

  private onDestroy: Subject<void> = new Subject<void>();
  private updateChartPlotted: Subject<boolean> = new Subject<boolean>();

  workorders!: IntWorkorder[];

  // for chart config
  fourMonthsIndexesArray!: number[];
  workordersPerSectionPerMonth!: IntWorkorder[];
  section!: string;

  // chart
  chart!: Chart;

  loading = true;
  loadingFailed = false;
  loadingDefaultError!: string;
  loadingFallbackError = `Plotting chart failed with error code U-MC-FMP-01. Please try reloading the page or report the error code if the issue persists.`;

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const workorders = changes['allWorkorders']?.currentValue;
    const section = changes['currentSection']?.currentValue;

    this.workorders = workorders ? workorders : this.workorders;
    this.section = section ? section : this.section;

    if (this.workorders && this.section) {
      this.generateMaitenanceCostForFourMonthsPeriod();
    }

  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  private generateMonthIndexes(months: number): number[] {
    const currentMonth = dayjs().month();
    let monthIndexes: number[] = [];
    for (let i = months; i >= 0; i--) {
      const month = currentMonth - i;
      monthIndexes.push(month);
    }


    return monthIndexes;
  }

  private formatCostAsInteger(cost: any): number {
    if (cost) {
      if (isNaN(+cost)) {
        const costString = cost.toString().replace(/[KSh\s,]+/g, '');
        return +costString;
      } else {
        return +cost;
      }
    }
    return 0;
  }

  // returns maintenance cost as int
  private filterWorkordersInSectionMonthAndYear(monthIndex: number, year: string): number[] {
    const maintenanceCostForSectionForMonthAndYear = this.workorders.filter(
      (workorder: IntWorkorder) => {
        const raised: dayjs.Dayjs = dayjs(workorder.raised.dateTime);
        const section = workorder.section.name;
        const workorderYear = raised.year();
        const workorderMonth = raised.month();

        return section === this.section && workorderYear === +year && workorderMonth === monthIndex;
      }
    )
      .map((workorder: IntWorkorder) => {
        const spareCost = workorder.sparesUsed.status ? this.formatCostAsInteger(workorder.sparesUsed.totalCost) : 0;
        const spareCostInMillions = spareCost / 1000000;
        return spareCostInMillions;
      });



    return maintenanceCostForSectionForMonthAndYear;
  }

  // returns the Chart object
  private createChart(labels: string[], maintenanceCostArray: number[]): Chart {
    const type: ChartType = 'line';

    const data: ChartConfiguration['data'] = {
      labels,
      datasets: [
        {
          data: maintenanceCostArray,
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

    const maximumCost = Math.max(...maintenanceCostArray);

    Chart.defaults.font.family = 'Lato, "Open Sans", Arial, Helvetica, Noto, "Lucida Sans", sans-serif';
    Chart.defaults.font.size = 14;
    Chart.defaults.font.lineHeight = 1.4;
    const chart = new Chart('fourMonthsPeriodChart', {
      type,
      data,
      plugins: [DataLabelsPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,

        elements: {
          line: {
            tension: 0.4
          }
        },

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
              text: 'Months'
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
              text: 'Million Ksh'
            },

            suggestedMin: 0,
            suggestedMax: maximumCost * 1.1,
            beginAtZero: true,

          }
        },

        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: ['Monthly Maintenance Costs', `${this.section}`]
          },
          datalabels: {
            display: 'auto',
            anchor: (context) => {
              const pointIndex = context.dataIndex;
              const contextIndex = context.datasetIndex;

              if (pointIndex === 0) {
                const currentPointData = data?.datasets[contextIndex]?.data[pointIndex];
                const nextPointData = context.chart.data?.datasets[contextIndex]?.data[pointIndex + 1];

                return currentPointData && nextPointData &&
                  currentPointData < nextPointData ? 'start' : 'end';
              }

              else {
                return 'end';
              }
            },

            align: (context) => {
              const pointIndex = context.dataIndex;
              const contextIndex = context.datasetIndex;
              const lastDataPoint = context.chart.data?.datasets[contextIndex]?.data?.length - 1;

              if (pointIndex === 0) {
                return 'right';
              }

              else if (pointIndex === lastDataPoint) {
                const currentPointData = context.chart.data.datasets[contextIndex].data[pointIndex];

                return 'top';
              }
              else {
                const currentPointData = context.chart.data.datasets[contextIndex].data[pointIndex];
                return currentPointData ? 'top' : 'end';
              }
            },

            textAlign: 'center',

            formatter: function (value, context) {
              // value falls on y-axis and 
              // value = 0
              if (+value === 0 && context.dataIndex === 0) {
                return '';
              } else {
                return value.toLocaleString('en-US', { minimumFractionDigits: 0 });
              }
            },
            color: 'black',
            offset: 10

          },
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
              const cost = chart.data.datasets[point.datasetIndex].data[point.index] as number;
              const month = chart.data.labels?.[point.index] as string;
              const monthData = { cost, month };
              this.activateOneMonthPeriodChart(monthData);
            }
          }

        }

      }
    });

    return chart;

  }

  private generateMaitenanceCostForFourMonthsPeriod(workordersYear?: string): void {
    const year = workordersYear || '2022';

    // chart variables
    let monthsLabels: string[] = [];
    let maintenanceCostArray: number[] = [];

    this.fourMonthsIndexesArray = this.generateMonthIndexes(3);

    // get the mtnc costs per section per month
    this.fourMonthsIndexesArray.forEach(
      (month: number) => {
        const monthAndTwoYearDigitLabel = dayjs(dayjs().month(month)).format('MMM YY');

        const maintenanceCost = this.filterWorkordersInSectionMonthAndYear(month, year)
          .reduce((totalCost: number, initialCost: number) =>
            totalCost + initialCost
            , 0);

        monthsLabels.push(monthAndTwoYearDigitLabel);
        maintenanceCostArray.push(maintenanceCost);
      }
    );

    // allows reusing canvas
    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = this.createChart(monthsLabels, maintenanceCostArray);

    // updates loading status on parent
    if (this.chart) {
      this.updateChartPlotted.next(true);
    } 
    
    else {
      this.updateChartPlotted.next(false);
      this.loadingDefaultError = `Plotting chart failed with error code MC-C-FMP-01. Please try reloading the page or report the error code if the issue persists.`;
    }
    // }

    // else {
    //   this.updateChartPlotted.next(false);
    //   this.loadingDefaultError = `Plotting chart failed with error code MC-C-FMP-02. Please try reloading the page or report the error code if the issue persists.`;
    // }
  }

  // show chart for selected month (weeks)
  private activateOneMonthPeriodChart({ month, cost }: { month: string, cost: number }): void {
    const oneMonthPeriodData: IntSwitchChart = {
      type: 'one-month-period',
      section: this.section,
      month,
      cost,
    };

    this.switchChart.emit(oneMonthPeriodData);
  }
}
