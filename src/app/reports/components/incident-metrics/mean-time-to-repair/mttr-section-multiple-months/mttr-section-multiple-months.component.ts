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
  selector: 'app-mttr-section-multiple-months',
  templateUrl: './mttr-section-multiple-months.component.html',
  styleUrls: ['./mttr-section-multiple-months.component.scss']
})
export class MttrSectionMultipleMonthsComponent implements OnInit, OnChanges, OnDestroy {

  @Input('workorders') allWorkorders!: IntWorkorder[];
  @Input('section') currentSection!: string;
  @Input('dateIndicesObject') selectedDateIndices!: IntDateIndices;
  @Input('totalMonthsPeriod') monthsToPlotOver!: number;
  @Input('useCustomRange') customDatesRange!: boolean;
  @Input('dateRangeLimits') firstAndLastDateRangeLimits!: IntDateRangeLimits;
  @Input('defaultYearIndex') defaultSelectedYear!: number;
  @Input('defaultMonthIndex') defaultSelectedMonth!: number;
  @Input('viableWorkorders') workorderTypes!: string[];

  @Output() chartPlotted: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() switchChart: EventEmitter<IntSwitchChart> = new EventEmitter<IntSwitchChart>();
  @Output() updateDateRangeLimits: EventEmitter<IntDateRangeLimits> = new EventEmitter<IntDateRangeLimits>();

  private onDestroy: Subject<void> = new Subject<void>();
  private updateChartPlotted: Subject<boolean> = new Subject<boolean>();

  workorders!: IntWorkorder[];
  // workorders to work on
  // based on workorder type
  viableWorkorders!: string[];

  dateIndicesObject!: IntDateIndices;

  // when custom range is defined
  useCustomRange!: boolean;
  dateRangeLimits!: IntDateRangeLimits;
  limitsUpdated = false;

  // for chart config
  multipleMonthsDatesArray!: IntDateIndices[];
  section!: string;

  // control months to show
  totalMonthsPeriod!: number;

  // for resetting chart
  defaultTotalMonthsPeriod!: number;
  defaultDateIndicesObject!: IntDateIndices;

  defaultYearIndex!: number;
  defaultMonthIndex!: number;

  // chart
  chart!: Chart;

  loading = true;
  loadingFailed = false;
  loadingDefaultError!: string;
  loadingFallbackError = `Plotting chart failed with error code U-IM-MMP-01. Please try reloading the page or report the error code if the issue persists.`;

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

  ngOnChanges(changes: SimpleChanges): void {
    const workorders = changes['allWorkorders']?.currentValue;
    const section = changes['currentSection']?.currentValue;
    const dateIndicesObject = changes['selectedDateIndices']?.currentValue;
    const totalMonthsPeriod = changes['monthsToPlotOver']?.currentValue;
    const useCustomRange = changes['customDatesRange']?.currentValue;
    const dateRangeLimits = changes['firstAndLastDateRangeLimits']?.currentValue;
    const defaultYearIndex = changes['defaultSelectedYear']?.currentValue;
    const defaultMonthIndex = changes['defaultSelectedMonth']?.currentValue;
    const viableWorkorders = changes['workorderTypes']?.currentValue;

    // tracks custom range changes from true to false
    const previousCustomRangeValue = changes['customDatesRange']?.previousValue;
    const currentCustomRangeValue = changes['customDatesRange']?.currentValue;

    this.workorders = workorders ? workorders : this.workorders;
    this.section = section ? section : this.section;
    this.dateIndicesObject = dateIndicesObject ? dateIndicesObject : this.dateIndicesObject;
    this.totalMonthsPeriod = totalMonthsPeriod ? totalMonthsPeriod : this.totalMonthsPeriod;
    this.useCustomRange = useCustomRange !== undefined ? useCustomRange : this.useCustomRange;
    this.dateRangeLimits = dateRangeLimits ? dateRangeLimits : this.dateRangeLimits;
    this.defaultYearIndex = defaultYearIndex ? defaultYearIndex : this.defaultYearIndex;
    this.defaultMonthIndex = defaultMonthIndex ? defaultMonthIndex : this.defaultMonthIndex;
    this.viableWorkorders = viableWorkorders ? viableWorkorders : this.viableWorkorders;

    if (this.workorders) {
      if (this.useCustomRange === true &&
        this.dateRangeLimits &&
        this.dateRangeLimits.limitsUpdated) {
        this.updateDateIndicesObject();
      }

      else if (previousCustomRangeValue === true &&
        currentCustomRangeValue === false) {
        this.resetDataPoints();
      }
      this.generateChartData();
    }
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  // resetting month periods and final data points
  private resetDataPoints(): void {
    const dateIndices: IntDateIndices = {
      yearIndex: this.defaultYearIndex,
      monthIndex: this.defaultMonthIndex
    };

    this.dateIndicesObject = dateIndices;
    this.totalMonthsPeriod = 4;
  }

  // limits updated by parent
  // updates the month to start with on chart
  // months will start at end then move backwards
  private updateDateIndicesObject(): any {
    // object to hold the data
    const firstDateObject: IntDateIndices = this.dateRangeLimits['firstDate'];
    const lastDateObject: IntDateIndices = this.dateRangeLimits['lastDate'];

    const firstYearIndex = firstDateObject['yearIndex'];
    const firstMonthIndex = firstDateObject['monthIndex'];
    const firstDate: dayjs.Dayjs = dayjs().year(firstYearIndex).month(firstMonthIndex);

    const lastYearIndex = lastDateObject['yearIndex'];
    const lastMonthIndex = lastDateObject['monthIndex'];
    const lastDate: dayjs.Dayjs = dayjs().year(lastYearIndex).month(lastMonthIndex);

    // use last date as the reference point
    const datesMatched = lastDate.isSame(firstDate);
    const lastDateLarger = lastDate.isAfter(firstDate);
    const lastDateSmaller = lastDate.isBefore(firstDate);

    let yearFactor: number = 0;

    return datesMatched || lastDateLarger ?
      (
        yearFactor = (lastYearIndex - firstYearIndex) * 12,
        this.totalMonthsPeriod = lastMonthIndex - firstMonthIndex + 1 + yearFactor,
        this.dateIndicesObject = {
          yearIndex: lastYearIndex,
          monthIndex: lastMonthIndex
        }
      )

      :

      (
        yearFactor = (firstYearIndex - lastYearIndex) * 12,
        this.totalMonthsPeriod = firstMonthIndex - lastMonthIndex + 1 + yearFactor,
        this.dateIndicesObject = {
          yearIndex: firstYearIndex,
          monthIndex: firstMonthIndex
        }
      );
  }

  // updates parent limits
  private updateDateRangeLimitsOnParent(datesArray: IntDateIndices[]): void {
    const firstDate = datesArray[0];
    const lastDate = datesArray[datesArray.length - 1];

    const dateRangeLimits: IntDateRangeLimits = { firstDate, lastDate, limitsUpdated: false };

    this.updateDateRangeLimits.emit(dateRangeLimits);
  }

  private generateDateIndicesArray(): IntDateIndices[] {
    let totalMonths = this.totalMonthsPeriod - 1;

    const yearIndex = this.dateIndicesObject['yearIndex'];
    const monthIndex = this.dateIndicesObject['monthIndex'];

    let monthsIndicesArray: IntDateIndices[] = [];
    while (totalMonths >= 0) {

      const month = monthIndex - totalMonths;
      const years = month < 0 ? Math.ceil(Math.abs(month) / 12) : 0;

      // correct for years between the dates
      const correctedMonthIndex = month + (years * 12);
      const correctedYearIndex = yearIndex - years;

      monthsIndicesArray.push({
        monthIndex: correctedMonthIndex,
        yearIndex: correctedYearIndex
      });
      totalMonths--;

    }
    this.updateDateRangeLimitsOnParent(monthsIndicesArray);
    return monthsIndicesArray;
  }

  // returns maintenance cost as int
  private filterWorkorders(yearIndex: number, monthIndex: number): number[] {
    let timeArray: number[] = [];

    for (let workorder of this.workorders) {
      const workorderSection: string = workorder.section.name;

      const raised = dayjs(workorder.raised.dateTime);

      const done = workorder.done.status;

      const workorderType = workorder.workorder.type;

      const workorderIsViable = this.viableWorkorders.includes(workorderType);
      if (
        workorderIsViable &&
        done &&
        workorderSection === this.section &&
        raised.year() === yearIndex &&
        raised.month() === monthIndex
      ) {
        const timeDone = dayjs(workorder.done.dateTime);

        const timeDifference = timeDone.diff(raised, 'minutes');
        timeArray.push(timeDifference);
      }
    }

    return timeArray;

  }

  // create the chart
  private createChart(labels: string[], dataArray: number[]): Chart {
    const type: ChartType = 'line';

    const data: ChartConfiguration['data'] = {
      labels,
      datasets: [
        {
          data: dataArray,
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

    const maximumMean = Math.max(...dataArray);

    Chart.defaults.font.family = 'Lato, "Open Sans", Arial, Helvetica, Noto, "Lucida Sans", sans-serif';
    Chart.defaults.font.size = 14;
    Chart.defaults.font.lineHeight = 1.4;
    Chart.register(annotationPlugin, DataLabelsPlugin);

    const chart = new Chart(
      'MTTRSectionMultipleMonths',
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
              text: ['MTTR', `${this.section}`]
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
                // EX: Apr 22
                const monthAndYear = chart.data.labels?.[point.index] as string;

                // EX: Apr
                // trim to remove white space after Apr
                const month = monthAndYear.slice(0, -2).trim();
                this.switchToSectionOneMonth(month);
              }
            }

          }

        }
      });

    return chart;

  }

  // generate chart data
  private generateChartData(): void {
    if (this.workorders.length) {
      let labelsArray: string[] = [];
      let dataArray: number[] = [];

      const monthsArray: IntDateIndices[] = this.generateDateIndicesArray();

      monthsArray.forEach(
        (dateObject: IntDateIndices) => {
          const yearIndex = dateObject['yearIndex'];
          const monthIndex = dateObject['monthIndex'];

          const monthAndTwoYearDigitLabel = dayjs().year(yearIndex).month(monthIndex).format('MMM YY');

          const workordersTimeArray: number[] = this.filterWorkorders(yearIndex, monthIndex);

          const totalWorkorders = workordersTimeArray.length;

          const totalTime = workordersTimeArray.reduce(
            (finalTime: number, initialTime: number) => finalTime + initialTime, 0
          );

          const mttr: number = this.calculateMTTR({ totalTime, totalWorkorders });

          labelsArray.push(monthAndTwoYearDigitLabel);
          dataArray.push(mttr);

        }
      );

      if (this.chart) {
        this.chart.destroy();
      }

      this.chart = this.createChart(labelsArray, dataArray);

      if (this.chart) {
        this.updateChartPlotted.next(true);
      } else {
        this.updateChartPlotted.next(false);
        this.loadingDefaultError = `Plotting chart faile with error code z-0101. Please try reloading the page or report this error code to support for assistance.`;
      }

    } else {
      this.updateChartPlotted.next(false);
      this.loadingDefaultError = `No Data found. Please try reloading the page or confirm there is available data in the home page.`;
    }
  }

  private calculateMTTR({ totalTime, totalWorkorders }: { totalTime: number, totalWorkorders: number }): number {
    let rate = totalTime / totalWorkorders;
    if (isNaN(rate)) {
      rate = 0;
    }

    return rate;
  }

  private switchToSectionOneMonth(month: string): void {
    const switchChartData: IntSwitchChart = {
      type: 'section-one-month',
      section: this.section,
      month
    };

    this.switchChart.emit(switchChartData);
  }
}
