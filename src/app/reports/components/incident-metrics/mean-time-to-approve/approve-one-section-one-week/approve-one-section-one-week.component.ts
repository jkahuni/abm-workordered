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
  selector: 'app-approve-one-section-one-week',
  templateUrl: './approve-one-section-one-week.component.html',
  styleUrls: ['./approve-one-section-one-week.component.scss']
})
export class ApproveOneSectionOneWeekComponent implements OnInit, OnChanges, OnDestroy {

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

    this.updateTotalWeeks
      .pipe(takeUntil(this.onDestroy))
      .subscribe((weeks: string[]) => {
        setTimeout(() => {
          this.updateWeeks.emit(weeks);
        });
      });
  }

  @Input('section') currentSection!: string;
  @Input('workorders') allWorkorders!: IntWorkorder[];
  @Input('viableWorkorders') workorderTypes!: string[];
  @Input('dateIndicesObject') selectedDateIndices!: IntDateIndices;
  @Input('week') weekLabel!: string;


  @Output() chartPlotted: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() updateWeeks: EventEmitter<string[]> = new EventEmitter<string[]>();

  private onDestroy = new Subject<void>();
  private updateChartPlotted: Subject<boolean> = new Subject<boolean>();
  private updateTotalWeeks: Subject<string[]> = new Subject<string[]>();


  section!: string;
  month!: string;
  week!: string;
  workorders!: IntWorkorder[];
  viableWorkorders!: string[];
  dateIndicesObject!: IntDateIndices;

  // chart
  chart!: Chart;

  loading = true;
  loadingFailed = false;
  loadingDefaultError!: string;
  loadingFallbackError = `Plotting chart failed with error code U-IM-OWP-01. Please try reloading the page or report the error code if the issue persists.`;


  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const workorders = changes['allWorkorders']?.currentValue;
    const section = changes['currentSection']?.currentValue;
    const dateIndicesObject = changes['selectedDateIndices']?.currentValue;
    const viableWorkorders = changes['workorderTypes']?.currentValue;
    const week = changes['weekLabel']?.currentValue;


    this.workorders = workorders ? workorders : this.workorders;
    this.section = section ? section : this.section;
    this.dateIndicesObject = dateIndicesObject ? dateIndicesObject : this.dateIndicesObject;
    this.viableWorkorders = viableWorkorders ? viableWorkorders : this.viableWorkorders;
    this.week = week ? week : this.week;

    if (this.workorders && this.week) {
      this.generateChartDataAndChart();
    }

  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  private createChartSubSubTitle(): string {
    const yearIndex = this.dateIndicesObject['yearIndex'];
    const monthIndex = this.dateIndicesObject['monthIndex'];

    // reconstruct as dayjs object
    const dateObject: dayjs.Dayjs = dayjs().year(yearIndex).month(monthIndex);

    // for the title
    const formattedMonthAndYear = dateObject.format('MMM YYYY');
    return `${formattedMonthAndYear}: ${this.week}`;
  }

  private calculateApprovalRate({ totalTime, totalWorkorders }: { totalTime: number, totalWorkorders: number }): number {
    let rate = totalTime / totalWorkorders;
    if (isNaN(rate)) {
      rate = 0;
    }

    return rate;
  }

  private updateTotalWeeksInMonth(weeks: string[]): any {
    this.updateTotalWeeks.next(weeks);
  }

  private extractDatesInEachWeek(): { [key: string]: string[] } {
    const yearIndex = this.dateIndicesObject['yearIndex'];
    const monthIndex = this.dateIndicesObject['monthIndex'];

    // reconstruct as dayjs object
    const dateObject: dayjs.Dayjs = dayjs().year(yearIndex).month(monthIndex);

    // get total days in the month
    const totalDaysInMonth = dateObject.daysInMonth();

    // set last day of the week
    // last day = sat = index 6
    const lastDayOfWeek: number = 6;

    // get all weeks in the month full/partial
    // one week = 7 days
    const totalWeeksInMonth: number = Math.ceil(totalDaysInMonth / 7);

    // obj with week labels as keys 
    // and dates in the week as string[]
    let datesInWeek: { [key: string]: string[] } = {};


    // date in month = 1
    let currentDate: number = 1;

    // index of the first day of the month
    // in the week where it falls
    const indexOfFirstDayOfMonth = dateObject.startOf('month').day();

    // set the first day as the starting point
    // for the analysis
    let indexOfDateInWeek: number = indexOfFirstDayOfMonth;

    // extract the dates in each week
    for (let week = 1; week <= totalWeeksInMonth; week++) {
      // dates in the week
      let dates: string[] = [];

      let date: number = currentDate;

      const weekLabel: string = `Week ${week}`;

      while (date <= totalDaysInMonth + 1) {
        // run checks first
        if ((lastDayOfWeek - indexOfDateInWeek) + 1 === 0
          || date === totalDaysInMonth + 1) {
          // set the dates in the week with their label
          datesInWeek[weekLabel] = dates;

          // reset index in week counter
          indexOfDateInWeek = 0;

          // empty dates list to begin anew
          dates = [];

          break;
        }

        const dayAsString: string = dayjs().year(yearIndex).month(monthIndex).date(currentDate).format('dd');

        const formattedDate: string = `${dayAsString} ${currentDate}`;

        dates.push(formattedDate);

        // increment day in month and week
        date++;
        indexOfDateInWeek++;

        // update current date
        currentDate = date;

      }
    }

    return datesInWeek;
  }

  //for x-axis labels
  private constructLabelsArray(datesObject: { [key: string]: string[] }): string[] {
    let labelsArray: string[] = [];
    let weekLabels: string[] = [];

    for (let key in datesObject) {
      weekLabels.push(key);

      if (key === this.week) {
        labelsArray = datesObject[key];
      }
    }

    this.updateTotalWeeksInMonth(weekLabels);
    return labelsArray;
  }

  private filterWorkorders(date: number): number[] {
    const yearIndex = this.dateIndicesObject['yearIndex'];
    const monthIndex = this.dateIndicesObject['monthIndex'];

    const totalTimeTaken: number[] = this.workorders
      .filter(
        (workorder: IntWorkorder) => {
          const raised = dayjs(workorder.raised.dateTime);
          const section = workorder.section.name;
          const approved = workorder.approved.status;
          const workorderType = workorder.workorder.type;
          const typeIsViable = this.viableWorkorders.includes(workorderType);
          const dateIsViable = raised.date() === date ? true : false;

          return typeIsViable &&
            dateIsViable &&
            approved &&
            section === this.section &&
            raised.year() === yearIndex &&
            raised.month() === monthIndex;
        })
      .map(
        (workorder: IntWorkorder) => {
          const raised = dayjs(workorder.raised.dateTime);
          const approved = dayjs(workorder.approved.dateTime);

          const timeDifference = approved.diff(raised, 'minutes');

          return timeDifference
        }
      );

    return totalTimeTaken;

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
      'approveOneSectionOneWeek',
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
                text: 'Dates'
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
              text: ['Mean Time To Approve',
                this.section,
                this.createChartSubSubTitle()
              ]
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
                    minimumFractionDigits: 0, maximumFractionDigits: 1
                  });
                }
              },
              color: 'black',
              offset: 10

            },

            tooltip: {
              backgroundColor: 'rgba(77, 83, 96, 1)',
              titleColor: 'white',
              bodyColor: 'white',
              footerColor: 'white',
              displayColors: false,
              filter: (context, index, tooltipItems, data) => {
                const yValue = Number(context.parsed.y);

                return yValue === 0 ? false : true;
              },
              callbacks: {
                title: (tooltipItem: any) => {
                  return this.formatTooltipTitle(tooltipItem);
                },
                beforeBody: (context) => {
                  if (context && context[0] && context[0].parsed.y > 0) {
                    return 'W/o No : Time Taken';
                  }
                  return '';
                },
                label: (tooltipItem: any) => {
                  return [...this.extractTooltipLabels(tooltipItem)];
                },
                footer: this.generateTooltipFooter
              }
            }
          },

          // interaction.mode default = 'nearest'
          interaction: {
            mode: 'nearest',
            axis: 'y'
          },

          // events: ['click'],

          // onClick: (event) => {
          //   const points = chart.getElementsAtEventForMode(event as unknown as Event, 'nearest', { intersect: true }, false);
          //   if (points.length) {
          //     const point = points[0];
          //     if (point) {
          //       const week = chart.data.labels?.[point.index] as string;
          //     }
          //   }

          // }

        }
      });

    return chart;

  }

  private generateChartDataAndChart(): void {
    if (this.workorders.length) {
      let xAxisLabels: string[] = [];
      let approvalRates: number[] = [];

      const datesObject = this.extractDatesInEachWeek();
      const datesLabels = this.constructLabelsArray(datesObject);

      datesLabels.forEach(
        (dateLabel: string) => {
          const date = Number(dateLabel.substring(2).trim());

          const workorders = this.filterWorkorders(date);

          const totalWorkorders = workorders.length;

          const totalTime = workorders.reduce(
            (final: number, initial: number) => final + initial, 0
          );

          const approvalRate = this.calculateApprovalRate({ totalTime, totalWorkorders });

          xAxisLabels.push(dateLabel);
          approvalRates.push(approvalRate);
        }
      );

      if (this.chart) {
        this.chart.destroy();
      }

      this.chart = this.createChart(xAxisLabels, approvalRates);

      if (this.chart) {
        this.updateChartPlotted.next(true);
      } else {
        this.updateChartPlotted.next(false);
        this.loadingDefaultError = `Plotting chart failed with error code IM-C-OWP-01. This might happen when there was an issue loading workorders. Please try reloading the page or report the error code if the issue persists.`;
      }

    }

    else {
      this.updateChartPlotted.next(false);
      this.loadingDefaultError = `Plotting chart failed with error code IM-C-OWP-02. This might happen when there was an issue loading workorders. Please try reloading the page or report the error code if the issue persists.`;

    }
  }

  private formatTooltipTitle(tooltipItem: any): string {
    if (tooltipItem && tooltipItem[0] && tooltipItem[0].label) {
      const label = tooltipItem[0].label;

      // substr accepts only start index
      // index can be - or +
      const dateIndex = Number(label.substring(2).trim());

      const yearIndex = this.dateIndicesObject['yearIndex'];

      const monthIndex = this.dateIndicesObject['monthIndex'];

      const formattedDate = dayjs().year(yearIndex).month(monthIndex).date(dateIndex).format('ddd DD, MMM YY');

      return formattedDate;
    }
    return '';
  }

  private extractTooltipLabels(tooltipItem: any): string[] {
    if (tooltipItem && tooltipItem.label) {
      const date = tooltipItem.label;

      const datePart = Number(date.substring(2).trim());

      const yearIndex = this.dateIndicesObject['yearIndex'];

      const monthIndex = this.dateIndicesObject['monthIndex'];

      let mTTAObject: string[] = [];

      // filters all workorders for
      // workorders in current month, year, and section
      const filteredWorkorders = this.workorders
        .filter(
          (workorder: IntWorkorder) => {
            const section: string = workorder.section.name;
            const raised = dayjs(workorder.raised.dateTime);
            const approved = workorder.approved.status;
            const workorderType = workorder.workorder.type;
            const typeIsViable = this.viableWorkorders.includes(workorderType);
            const dateIsViable = raised.date() === datePart ? true : false;

            return typeIsViable &&
              approved &&
              dateIsViable &&
              section === this.section &&
              raised.year() === yearIndex &&
              raised.month() === monthIndex;
          }
        )
        .map((workorder: IntWorkorder) => {
          const workorderNumber = workorder.workorder.number;
          const raised = dayjs(workorder.raised.dateTime);
          const approved = dayjs(workorder.approved.dateTime);

          const timeDifference = approved.diff(raised, 'minutes');
          return { workorderNumber, timeDifference };
        })
        .forEach(
          (workorderData: { workorderNumber: string, timeDifference: number }, index: number) => {
            const returnObject = `${index + 1}. ${workorderData.workorderNumber}: ${workorderData.timeDifference} min`;

            mTTAObject.push(returnObject);
          }
        );

      return mTTAObject;
    }
    return [''];
  }

  private generateTooltipFooter(tooltipItems: any): string {
    if (tooltipItems && tooltipItems[0]) {
      let average = 0;
      let formattedAverage: string = '';

      tooltipItems.forEach(
        (tooltipItem: any) => {
          const value = tooltipItem.parsed.y;
          average += value;
          formattedAverage = average.toLocaleString('en-US', {
            minimumFractionDigits: 0, maximumFractionDigits: 1
          });

        }
      );

      return `Average: ${formattedAverage}`;
    }

    return '';
  }
}
