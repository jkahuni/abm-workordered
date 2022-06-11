import { Component, OnDestroy, OnInit, Input, OnChanges, Output, SimpleChanges, EventEmitter } from '@angular/core';

// rxjs
import { takeUntil, Subject } from 'rxjs';

// interfaces
import { IntWorkorder } from '@workorders/models/workorders.models';
import { IntSwitchChart, IntDateIndices, IntDateRangeLimits } from '@reports/models/reports.models';


// for chart
import { ChartConfiguration, ChartType, Chart } from 'chart.js';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import annotationPlugin from 'chartjs-plugin-annotation';


// dayjs
import * as dayjs from 'dayjs';


@Component({
  selector: 'app-approve-one-section-one-month',
  templateUrl: './approve-one-section-one-month.component.html',
  styleUrls: ['./approve-one-section-one-month.component.scss']
})
export class ApproveOneSectionOneMonthComponent implements OnInit, OnChanges, OnDestroy {

  constructor() {
    this.updateChartPlotted
      .pipe(takeUntil(this.onDestroy))
      .subscribe((status: boolean) => setTimeout(() => {
        this.chartPlotted.emit(status);
        setTimeout(() => {
          this.loading = false;
        });
        if (!status) {
          this.loadingFailed = true;
        }
      }));
  }

  @Input('workorders') allWorkorders!: IntWorkorder[];
  @Input('section') currentSection!: string;
  @Input('dateIndicesObject') selectedDateIndices!: IntDateIndices;
  @Input('viableWorkorders') workorderTypes!: string[];

  @Output() chartPlotted: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() switchChart: EventEmitter<IntSwitchChart> = new EventEmitter<IntSwitchChart>();

  private onDestroy: Subject<void> = new Subject<void>();
  private updateChartPlotted: Subject<boolean> = new Subject<boolean>();

  workorders!: IntWorkorder[];
  viableWorkorders!: string[];
  dateIndicesObject!: IntDateIndices;
  section!: string;

  // chart
  chart!: Chart;

  loading = true;
  loadingFailed = false;
  loadingDefaultError!: string;
  loadingFallbackError = `Plotting chart failed with error code U-IM-OMP-01. Please try reloading the page or report the error code if the issue persists.`;


  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const workorders = changes['allWorkorders']?.currentValue;
    const section = changes['currentSection']?.currentValue;
    const dateIndicesObject = changes['selectedDateIndices']?.currentValue;
    const viableWorkorders = changes['workorderTypes']?.currentValue;


    this.workorders = workorders ? workorders : this.workorders;
    this.section = section ? section : this.section;
    this.dateIndicesObject = dateIndicesObject ? dateIndicesObject : this.dateIndicesObject;
    this.viableWorkorders = viableWorkorders ? viableWorkorders : this.viableWorkorders;


    if (this.workorders) {
      this.generateChartDataAndChart();
    }
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  // generates title to be used in the chart
  private generateSectionAndMonthTitle(): string {
    const monthIndex = this.dateIndicesObject['monthIndex'];
    const yearIndex = this.dateIndicesObject['yearIndex'];

    const formattedMonthYear: string = dayjs().year(yearIndex).month(monthIndex).format('MMM YYYY');

    return `${this.section}: ${formattedMonthYear}`;

  }

  // configures dates in the specific weeks
  private setDatesInWeeks(): { [key: string]: string[] } {
    const yearIndex: number = this.dateIndicesObject['yearIndex'];
    const monthIndex: number = this.dateIndicesObject['monthIndex'];

    const dateObject: dayjs.Dayjs = dayjs().year(yearIndex).month(monthIndex);

    const daysInMonth: number = dateObject.daysInMonth();

    const lastDayOfWeek: number = 6;

    const totalWeeksInMonth: number = Math.ceil(daysInMonth / 7);

    const firstDayIndex: number = dateObject.startOf('month').day();

    // used to initialize date in the loop
    // also holds updated value of date when moving from
    // inner to outer loop
    let currentDate: number = 1;

    let indexOfDateInWeek: number = firstDayIndex;

    // the return object
    let datesInWeek: { [key: string]: string[] } = {};

    for (let week = 1; week <= totalWeeksInMonth; week++) {
      let dates: string[] = [];

      let date = currentDate;

      const weekLabel = `Week ${week}`;

      while (date <= daysInMonth + 1) {
        // condition to break the loop
        if ((lastDayOfWeek - indexOfDateInWeek) + 1 === 0 || date === daysInMonth + 1) {
          datesInWeek[weekLabel] = dates;
          indexOfDateInWeek = 0;
          dates = [];
          break;
        }

        // formatting will be used to filter workorders later
        let dateInMonth = dayjs().year(yearIndex).month(monthIndex).date(currentDate).format('MMM DD, YYYY');

        dates.push(dateInMonth);

        date++;
        indexOfDateInWeek++;
        currentDate = date;
      }
    }

    return datesInWeek;
  }

  private calculateApprovalRate({ totalTime, totalWorkorders }: { totalTime: number, totalWorkorders: number }): number {
    let rate = totalTime / totalWorkorders;
    if (isNaN(rate)) {
      rate = 0;
    }

    return rate;
  }

  private filterWorkorders(weekLabel: string): number[] {
    const yearIndex = this.dateIndicesObject['yearIndex'];
    const monthIndex = this.dateIndicesObject['monthIndex'];
    const dates: string[] = this.setDatesInWeeks()[weekLabel];

    const filteredWorkorders = this.workorders
      .filter((workorder: IntWorkorder) => {
        const section = workorder.section.name;
        const approved = workorder.approved.status;
        const raised = dayjs(workorder.raised.dateTime);
        const workorderType = workorder.workorder.type;
        const workorderIsViable = this.viableWorkorders.includes(workorderType);
        const dateIsViable = dates.includes(raised.format('MMM DD, YYYY'));

        return workorderIsViable &&
          dateIsViable &&
          approved &&
          section === this.section &&
          raised.year() === yearIndex &&
          raised.month() === monthIndex
          ;

      })
      .map((workorder: IntWorkorder) => {
        const raised = dayjs(workorder.raised.dateTime);
        const approved = dayjs(workorder.approved.dateTime);

        const timeDifference = approved.diff(raised, 'minutes')

        return timeDifference;

      });

    return filteredWorkorders;
  }

  private constructLabelsArray(): string[] {
    const datesObject: { [key: string]: string[] } = this.setDatesInWeeks();

    let labelsArray: string[] = [];

    for (let key in datesObject) {
      labelsArray.push(key);
    }

    return labelsArray;
  }

  // create the chart
  private createChart(labels: string[], approvalRatesArray: number[]): Chart {
    const type: ChartType = 'line';

    const data: ChartConfiguration['data'] = {
      labels,
      datasets: [
        {
          data: approvalRatesArray,
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

    const maximumMean = Math.max(...approvalRatesArray);

    Chart.defaults.font.family = 'Lato, "Open Sans", Arial, Helvetica, Noto, "Lucida Sans", sans-serif';
    Chart.defaults.font.size = 14;
    Chart.defaults.font.lineHeight = 1.4;
    Chart.register(annotationPlugin, DataLabelsPlugin);

    const chart = new Chart(
      'approveOneSectionOneMonth',
      {
        type,
        data,
        // plugins: [DataLabelsPlugin],
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
                text: 'Weeks'
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
                text: 'Minutes'
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
              text: ['Mean Time To Approve', this.generateSectionAndMonthTitle()]
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
                  // const currentPointData = context.chart.data.datasets[contextIndex].data[pointIndex];

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
                if (+value === 0) {
                  if (context.dataIndex === 0) {
                    return '';
                  }
                  return 'N/A';
                } else {
                  return value.toLocaleString('en-US', {
                    minimumFractionDigits: 1, maximumFractionDigits: 1
                  });
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
                const week = chart.data.labels?.[point.index] as string;
                this.switchToApproveOneSectionOneWeek(week);
              }
            }

          }

        }
      });

    return chart;

  }

  // generate chart data
  private generateChartDataAndChart(): void {
    if (this.workorders.length) {
      let xAxisLabels: string[] = [];
      let approvalRatesArray: number[] = [];

      const weekLabels = this.constructLabelsArray();

      weekLabels.forEach(
        (weekLabel: string) => {
          const workorders = this.filterWorkorders(weekLabel);

          const totalWorkorders = workorders.length;

          const totalTime = workorders.reduce(
            (finalTime: number, initialTime: number) => finalTime + initialTime, 0);

          const approvalRate = this.calculateApprovalRate({ totalTime, totalWorkorders });

          xAxisLabels.push(weekLabel);
          approvalRatesArray.push(approvalRate);
        }
      );

      if (this.chart) {
        this.chart.destroy();
      }

      this.chart = this.createChart(xAxisLabels, approvalRatesArray);

      if (this.chart) {
        this.updateChartPlotted.next(true);

      }
      else {
        this.updateChartPlotted.next(false);
        this.loadingDefaultError = `Plotting chart failed with error code IM-C-OMP-01. Please try reloading the page or report the error code if the issue persists.`;
      }

    }

    else {
      this.updateChartPlotted.next(false);
      this.loadingDefaultError = `Plotting chart failed with error code IM-C-OMP-02. Please try reloading the page or report the error code if the issue persists.`;

    }
  }

  private switchToApproveOneSectionOneWeek(week: string): void {
    const chartData: IntSwitchChart = {
      type: 'approve-one-section-one-week',
      section: this.section,
      week,
      weeks: this.constructLabelsArray()
    };

    this.switchChart.emit(chartData);
  }
}
