import { Component, OnDestroy, OnInit, Input, OnChanges, Output, SimpleChanges, EventEmitter } from '@angular/core';

// rxjs
import { takeUntil, Subject } from 'rxjs';

// interfaces
import { IntWorkorder } from '@workorders/models/workorders.models';
import { IntSwitchChart, IntDateIndices, IntDateRangeLimits } from '@reports/models/reports.models';


// for chart
import { ChartConfiguration, ChartType, Chart } from 'chart.js';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';

// dayjs
import * as dayjs from 'dayjs';


@Component({
  selector: 'app-mc-one-section-multiple-months-period',
  templateUrl: './mc-one-section-multiple-months-period.component.html',
  styleUrls: ['./mc-one-section-multiple-months-period.component.scss']
})
export class McOneSectionMultipleMonthsPeriodComponent implements OnInit, OnDestroy, OnChanges {

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
  @Input('dateIndicesObject') selectedDateIndices!: IntDateIndices;
  @Input('totalMonthsPeriod') monthsToPlotOver!: number;
  @Input('useCustomRange') customDatesRange!: boolean;
  @Input('dateRangeLimits') firstAndLastDateRangeLimits!: IntDateRangeLimits;

  @Output() chartPlotted: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() switchChart: EventEmitter<IntSwitchChart> = new EventEmitter<IntSwitchChart>();
  @Output() updateDateRangeLimits: EventEmitter<IntDateRangeLimits> = new EventEmitter<IntDateRangeLimits>();

  private onDestroy: Subject<void> = new Subject<void>();
  private updateChartPlotted: Subject<boolean> = new Subject<boolean>();

  workorders!: IntWorkorder[];
  dateIndicesObject!: IntDateIndices;

  // when custom range is defined
  useCustomRange!: boolean;
  dateRangeLimits!: IntDateRangeLimits;
  limitsUpdated = false;
  yearFactor!: number;


  // for chart config
  multipleMonthsDatesArray!: IntDateIndices[];
  section!: string;

  // control months to show
  totalMonthsPeriod!: number;

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
    const dateIndicesObject = changes['selectedDateIndices']?.currentValue;
    const totalMonthsPeriod = changes['monthsToPlotOver']?.currentValue;
    const useCustomRange = changes['customDatesRange']?.currentValue;
    const dateRangeLimits = changes['firstAndLastDateRangeLimits']?.currentValue;


    this.workorders = workorders ? workorders : this.workorders;
    this.section = section ? section : this.section;
    this.dateIndicesObject = dateIndicesObject ? dateIndicesObject : this.dateIndicesObject;
    this.totalMonthsPeriod = totalMonthsPeriod ? totalMonthsPeriod : this.totalMonthsPeriod;

    this.useCustomRange = useCustomRange ? useCustomRange : this.useCustomRange;
    this.dateRangeLimits = dateRangeLimits ? dateRangeLimits : this.dateRangeLimits;

    if (this.workorders && this.section && this.dateIndicesObject && this.totalMonthsPeriod) {
      this.generateMaitenanceCostForFourMonthsPeriod();
    }

    if (this.dateRangeLimits && this.dateRangeLimits.limitsUpdated) {
      this.generateUpdatedDateIndicesArray();
      this.generateMaitenanceCostForFourMonthsPeriod();
    }

  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  // default method when no limits updated from parent
  private generateDateIndicesArray(): IntDateIndices[] {
    let totalMonths = this.totalMonthsPeriod - 1;
    let yearFactor = this.yearFactor || 0;


    const yearIndex = this.dateIndicesObject['yearIndex'];
    const monthIndex = this.dateIndicesObject['monthIndex'];

    let monthsIndicesArray: IntDateIndices[] = [];
    while (totalMonths >= 0) {
      
      const month = monthIndex - totalMonths;
      const years = month < 0 ? Number(String(Math.abs(month)).slice(0, 1)) : 0;
     
      // correct for years between the dates
      const correctedMonthIndex = month + (years * 12);
      const correctedYearIndex = yearIndex - years;

      monthsIndicesArray.push({
        monthIndex: correctedMonthIndex,
        yearIndex: correctedYearIndex
      });

      console.log(yearFactor, month, totalMonths);


      totalMonths--;

    }

    this.setFirstAndLastDateRanges(monthsIndicesArray);
    return monthsIndicesArray;
  }

  // with limits updated by parent
  private generateUpdatedDateIndicesArray(): void {
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

    if (datesMatched || lastDateLarger) {
      const yearFactor = (lastYearIndex - firstYearIndex) * 12;
      this.yearFactor = yearFactor;
      this.totalMonthsPeriod = lastMonthIndex - firstMonthIndex + 1 + yearFactor;
      this.dateIndicesObject = {
        yearIndex: lastYearIndex,
        monthIndex: lastMonthIndex
      };
    }

    else if (lastDateSmaller) {
      const yearFactor = (firstYearIndex - lastYearIndex) * 12;
      this.yearFactor = yearFactor;
      this.totalMonthsPeriod = firstMonthIndex - lastMonthIndex + 1 + yearFactor;
      this.dateIndicesObject = {
        yearIndex: firstYearIndex,
        monthIndex: firstMonthIndex
      };
    }
  }

  private setFirstAndLastDateRanges(datesArray: IntDateIndices[]): void {
    const firstDate = datesArray[0];
    const lastDate = datesArray[datesArray.length - 1];

    const dateRangeLimits: IntDateRangeLimits = { firstDate, lastDate, limitsUpdated: false };

    this.updateDateRangeLimits.emit(dateRangeLimits);
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
  private filterWorkordersInSectionMonthAndYear(monthIndex: number, year: number): number[] {
    const maintenanceCostForSectionForMonthAndYear = this.workorders.filter(
      (workorder: IntWorkorder) => {
        const raised: dayjs.Dayjs = dayjs(workorder.raised.dateTime);
        const section = workorder.section.name;
        const workorderYear = raised.year();
        const workorderMonth = raised.month();

        return section === this.section && workorderYear === year && workorderMonth === monthIndex;
      }
    )
      .map((workorder: IntWorkorder) => {
        const sparesCost = workorder.sparesUsed.status ? this.formatCostAsInteger(workorder.sparesUsed.totalCost) : 0;
        const sparesCostInMillions = sparesCost / 1000000;
        return sparesCostInMillions;
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
    const chart = new Chart(
      'mcOneSectionMultipleMonthsPeriodChart',
      {
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
                // EX: Apr 22
                const monthAndYear = chart.data.labels?.[point.index] as string;

                // EX: Apr
                // trim to remove white space after Apr
                const month = monthAndYear.slice(0, -2).trim();
                this.switchToOneSectionOneMonthPeriod(month);
              }
            }

          }

        }
      });

    return chart;

  }

  private generateMaitenanceCostForFourMonthsPeriod(): void {
    // chart variables
    let monthsLabels: string[] = [];
    let maintenanceCostArray: number[] = [];

    this.multipleMonthsDatesArray = this.generateDateIndicesArray();

    // get the mtnc costs per section per month
    this.multipleMonthsDatesArray.forEach(
      (datesIndex: IntDateIndices) => {
        const yearIndex = datesIndex['yearIndex'];
        const monthIndex = datesIndex['monthIndex'];
        const monthAndTwoYearDigitLabel = dayjs().year(yearIndex).month(monthIndex).format('MMM YY');

        const maintenanceCost = this.filterWorkordersInSectionMonthAndYear(monthIndex, yearIndex)
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
  private switchToOneSectionOneMonthPeriod(month: string): void {
    const oneMonthPeriodData: IntSwitchChart = {
      type: 'one-section-one-month-period',
      section: this.section,
      month
    };

    this.switchChart.emit(oneMonthPeriodData);
  }
}
