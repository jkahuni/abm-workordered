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
  selector: 'app-mc-one-section-one-month-period',
  templateUrl: './mc-one-section-one-month-period.component.html',
  styleUrls: ['./mc-one-section-one-month-period.component.scss']
})
export class McOneSectionOneMonthPeriodComponent implements OnInit, OnChanges, OnDestroy {

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

  @Input('section') currentSection!: string;
  @Input('workorders') allWorkorders!: IntWorkorder[];
  @Input('dateIndicesObject') selectedDateIndices!: IntDateIndices;


  @Output() chartPlotted: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() switchChart: EventEmitter<IntSwitchChart> = new EventEmitter<IntSwitchChart>();

  private onDestroy = new Subject<void>();
  private updateChartPlotted: Subject<boolean> = new Subject<boolean>();


  section!: string;
  month!: string;
  workorders!: IntWorkorder[];
  dateIndicesObject!: IntDateIndices;

  // chart
  chart!: Chart;

  loading = true;
  loadingFailed = false;
  loadingDefaultError!: string;
  loadingFallbackError = `Plotting chart failed with error code U-MC-OMP-01. Please try reloading the page or report the error code if the issue persists.`;


  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const section = changes['currentSection']?.currentValue;
    const dateIndicesObject = changes['selectedDateIndices']?.currentValue;
    const workorders = changes['allWorkorders']?.currentValue;

    this.section = section ? section : this.section;
    this.dateIndicesObject = dateIndicesObject ? dateIndicesObject : this.dateIndicesObject;
    this.workorders = workorders ? workorders : this.workorders;


    if (this.section && this.dateIndicesObject && this.workorders) {
      this.generateMaintenanceCostForOneMonthPeriod();
    }
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  private generateSectionAndMonthTitle(): string {
    const monthIndex = this.dateIndicesObject['monthIndex'];
    const yearIndex = this.dateIndicesObject['yearIndex'];

    // format as dayjs object to allow further manipulations
    const formattedMonthYear: string = dayjs().year(yearIndex).month(monthIndex).format('MMM YY');

    return `${this.section}: ${formattedMonthYear}`;

  }

  private setDatesInEachWeekOfSelectedMonth(): any {
    // get year
    const yearIndex = this.dateIndicesObject['yearIndex'];

    // get month index (0-indexed)
    const monthIndex = this.dateIndicesObject['monthIndex'];

    // construct date
    const dateObject: dayjs.Dayjs = dayjs().year(yearIndex).month(monthIndex);;

    // get total days in the month
    const daysInMonth = dateObject.daysInMonth();

    // week ends on sat (index 6)
    const lastDayOfWeek = 6;

    // get upper limit for total number of weeks in the month
    // some weeks will be full (7 days)
    // others will be partially full (< 7 days)
    const totalWeeksInMonth = Math.ceil(daysInMonth / 7);

    // object to be returned
    let datesInEachWeek: { [key: string]: string[] } = {};

    // first of every month will be date 1
    let currentDate: number = 1;

    // get index of 1st of the month in the current week
    const dayIndexOfFirstOfMonth = dateObject.startOf('month').day();

    // set the initial index of the day in the week
    let dayIndexInTheWeek: number = dayIndexOfFirstOfMonth;

    for (let week = 1; week <= totalWeeksInMonth; week++) {
      let dates: string[] = [];

      let day = currentDate;

      const weekLabel: string = `Week ${week}`;

      // const weekLabel = week === 1 ? 'Week 1' : week === 2 ? 'Week 2' : week === 3 ? 'Week 3' : week === 4 ? 'Week 4' : week === 5 ? 'Week 5' : week === 6 ? 'Week 6' : week === 7 ? 'Week 7' : 'Week U';

      while (day <= daysInMonth + 1) {
        if ((lastDayOfWeek - dayIndexInTheWeek) + 1 === 0 || day === daysInMonth + 1) {
          datesInEachWeek[weekLabel] = dates;
          dayIndexInTheWeek = 0;
          dates = [];
          break;
        }

        let dateInMonth = dayjs().year(yearIndex).month(monthIndex).set('date', currentDate);

        dates.push(dateInMonth.format('MMM DD, YYYY'));
        day++;
        dayIndexInTheWeek++;

        currentDate = day;
      }
    }

    return datesInEachWeek;

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

  // filter workorders
  private filterWorkordersInSectionAndMonthAndWeek(weekLabel: string): number[] {
    const yearIndex = this.dateIndicesObject['yearIndex'];

    const monthIndex = this.dateIndicesObject['monthIndex'];

    // workorders in section
    const workordersInCurrentSection = this.workorders.filter(
      (workorder: IntWorkorder) => {
        const section: string = workorder.section.name;

        return section === this.section;
      }
    );

    // workorders in current month
    const currentMonthsWorkorders = workordersInCurrentSection.filter(
      (workorder: IntWorkorder) => {
        const workorderRaisedYear: number = dayjs(workorder.raised.dateTime).year();
        const workorderRaisedMonth: number = dayjs(workorder.raised.dateTime).month();

        return workorderRaisedYear === yearIndex && workorderRaisedMonth === monthIndex;
      });

    // workorders in current week
    let maintenanceCostForWorkordersInWeek: number[] = [];

    currentMonthsWorkorders.forEach(
      (workorder: IntWorkorder) => {
        // gets raisedDate on workorder
        // format will be used for comparison
        const raised: string = dayjs(workorder.raised.dateTime).format('MMM DD, YYYY');

        // gets dates object with weekLabel as key
        const datesObject: { [key: string]: string[] } = this.setDatesInEachWeekOfSelectedMonth();

        // gets array of dates in passed week
        const dates: string[] = datesObject[weekLabel];

        if (dates.includes(raised)) {
          const spareCost = workorder.sparesUsed.status ? this.formatCostAsInteger(workorder.sparesUsed.totalCost) : 0;
          const spareCostInMillions = spareCost / 1000000;

          maintenanceCostForWorkordersInWeek.push(spareCostInMillions)
        }
      }
    );

    return maintenanceCostForWorkordersInWeek;
  }

  // construct x-axis labels
  // labels will be the object keys
  private constructLabelsArray(): string[] {
    const datesObject = this.setDatesInEachWeekOfSelectedMonth();

    let labelsArray: string[] = [];

    for (let key in datesObject) {
      labelsArray.push(key);
    }

    return labelsArray;

  }

  // create the chart
  private createOneMonthPeriodChart(labels: string[], maintenanceCostsArray: number[]): Chart {
    const type: ChartType = 'line';

    const data: ChartConfiguration['data'] = {
      labels,
      datasets: [
        {
          data: maintenanceCostsArray,
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

    const maximumCost = Math.max(...maintenanceCostsArray);

    Chart.defaults.font.family = 'Lato, "Open Sans", Arial, Helvetica, Noto, "Lucida Sans", sans-serif';
    Chart.defaults.font.size = 14;
    Chart.defaults.font.lineHeight = 1.4;
    const chart = new Chart(
      'mcOneSectionOneMonthPeriodChart',
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
              text: ['Weekly Maintenance Costs',
                this.generateSectionAndMonthTitle()
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
                  return value.toLocaleString('en-US', {
                    minimumFractionDigits: 0, maximumFractionDigits: 3
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
                this.switchToOneSectionOneWeekPeriod(week);
              }
            }

          }

        }
      });

    return chart;

  }

  // generate chart data
  private generateMaintenanceCostForOneMonthPeriod(): void {
    if (this.workorders.length) {
      // variables
      let maintenanceCostsArray: number[] = [];

      // constants
      const weekLabels: string[] = this.constructLabelsArray();

      // get workorders for each week
      // then reduce to get their maintenance costs
      weekLabels.forEach(
        (weekLabel: string) => {
          const workorders = this.filterWorkordersInSectionAndMonthAndWeek(weekLabel);

          const maintenanceCost: number = workorders
            .reduce(
              (finalSparesCost: number, initialSpareCost: number) => finalSparesCost + initialSpareCost
              , 0
            );

          maintenanceCostsArray.push(maintenanceCost);
        }
      );

      // allows reusing canvas
      if (this.chart) {
        this.chart.destroy();
      }

      this.chart = this.createOneMonthPeriodChart(weekLabels, maintenanceCostsArray);

      // updates loading status on parent
      if (this.chart) {
        this.updateChartPlotted.next(true);
      }

      else {
        this.updateChartPlotted.next(false);
        this.loadingDefaultError = `Plotting chart failed with error code MC-C-OMP-01. Please try reloading the page or report the error code if the issue persists.`;
      }
    }

    else {
      this.updateChartPlotted.next(false);
      this.loadingDefaultError = `Plotting chart failed with error code MC-C-OMP-02. Please try reloading the page or report the error code if the issue persists.`;
    }

  }

  // show chart for selected week = days
  private switchToOneSectionOneWeekPeriod(week: string) {
    const oneWeekPeriodData: IntSwitchChart = {
      type: 'one-section-one-week-period',
      section: this.section,
      month: this.month,
      week,
      weeks: this.constructLabelsArray()
    };

    this.switchChart.emit(oneWeekPeriodData);


  }

}
