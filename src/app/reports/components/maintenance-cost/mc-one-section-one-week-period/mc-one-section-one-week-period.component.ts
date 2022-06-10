import { Component, OnInit, Output, EventEmitter, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

// interfaces
import { IntSwitchChart, IntDateIndices } from '@reports/models/reports.models';
import { IntWorkorder } from '@workorders/models/workorders.models';

// rxjs
import { takeUntil, Subject } from 'rxjs';


// for chart
import { ChartConfiguration, ChartType, Chart, TooltipPositionerMap } from 'chart.js';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';

// dayjs
import * as dayjs from 'dayjs';


@Component({
  selector: 'app-mc-one-section-one-week-period',
  templateUrl: './mc-one-section-one-week-period.component.html',
  styleUrls: ['./mc-one-section-one-week-period.component.scss']
})
export class McOneSectionOneWeekPeriodComponent implements OnInit, OnChanges, OnDestroy {

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


  private onDestroy = new Subject<void>();
  private updateChartPlotted: Subject<boolean> = new Subject<boolean>();
  private updateTotalWeeks: Subject<string[]> = new Subject<string[]>();


  @Input('section') currentSection!: string;
  @Input('workorders') allWorkorders!: IntWorkorder[];
  @Input('dateIndicesObject') selectedDateIndices!: IntDateIndices;
  @Input('week') weekLabel!: string;

  @Output() chartPlotted: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() switchChart: EventEmitter<IntSwitchChart> = new EventEmitter<IntSwitchChart>();
  @Output() updateWeeks: EventEmitter<string[]> = new EventEmitter<string[]>();


  section!: string;
  month!: string;
  week!: string;
  workorders!: IntWorkorder[];
  dateIndicesObject!: IntDateIndices;
  formattedMonthAndYear!: string;

  // chart
  chart!: Chart;

  loading = true;
  loadingFailed = false;
  loadingDefaultError!: string;
  loadingFallbackError = `Plotting chart failed with error code U-MC-OWP-01. Please try reloading the page or report the error code if the issue persists.`;


  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const section = changes['currentSection']?.currentValue;
    const dateIndicesObject = changes['selectedDateIndices']?.currentValue;
    const workorders = changes['allWorkorders']?.currentValue;
    const week = changes['weekLabel']?.currentValue;

    this.section = section ? section : this.section;
    this.dateIndicesObject = dateIndicesObject ? dateIndicesObject : this.dateIndicesObject;
    this.workorders = workorders ? workorders : this.workorders;
    this.week = week ? week : this.week;

    if (this.workorders && this.week) {
      this.generateMaintenanceCostForOneWeekPeriod();
    }
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  // helper/formatter fn
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

  private createChartSubSubTitle(): string {
    const yearIndex = this.dateIndicesObject['yearIndex'];
    const monthIndex = this.dateIndicesObject['monthIndex'];

    // reconstruct as dayjs object
    const dateObject: dayjs.Dayjs = dayjs().year(yearIndex).month(monthIndex);

    // for the title
    this.formattedMonthAndYear = dateObject.format('MMM YYYY');
    return `${this.formattedMonthAndYear}: ${this.week}`;
  }

  private updateTotalWeeksInMonth(totalWeeks: number): any {
    let weeks: string[] = [];
    for (let i = 1; i <= totalWeeks; i++) {
      weeks.push(`Week ${i}`);

    }
    this.updateTotalWeeks.next(weeks);
  }

  // get dates in each week
  // returns the dates in only one week
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

    // enables smoooth transition
    // in parent component when 
    // changing weeks/months/years
    this.updateTotalWeeksInMonth(totalWeeksInMonth);

    // obj with week labels as keys 
    // and dates in the week as string[]
    let datesInEachWeek: { [key: string]: string[] } = {};


    // date in month = 1
    let currentDate: number = 1;

    // index of the first day of the month
    // in the week where it falls
    const indexOfFirstDayOfMonth = dateObject.startOf('month').day();

    // set the first day as the starting point
    // for the analysis
    let indexOfDayInWeek: number = indexOfFirstDayOfMonth;

    // extract the dates in each week
    for (let week = 1; week <= totalWeeksInMonth; week++) {
      // dates in the week
      let dates: string[] = [];

      let day: number = currentDate;

      const weekLabel: string = `Week ${week}`;

      while (day <= totalDaysInMonth + 1) {
        // run checks first
        if ((lastDayOfWeek - indexOfDayInWeek) + 1 === 0
          || day === totalDaysInMonth + 1) {
          // set the dates in the week with their label
          datesInEachWeek[weekLabel] = dates;

          // reset index in week counter
          indexOfDayInWeek = 0;

          // empty dates list to begin anew
          dates = [];

          break;
        }

        const dayAsString: string = dayjs().year(yearIndex).month(monthIndex).date(currentDate).format('dd');

        const formattedDate: string = `${dayAsString} ${currentDate}`;

        dates.push(formattedDate);

        // increment day in month and week
        day++;
        indexOfDayInWeek++;

        // update current date
        currentDate = day;

      }
    }

    return datesInEachWeek;
  }

  // filter the workorders in the passed section
  // returns mtnc costs [] for workoder
  // raised on specified day
  private filterWorkorders(dateParts: string): number[] {
    // substring accepts start and end indices
    const date = Number(dateParts.substring(2).trim());
    const yearIndex = this.dateIndicesObject['yearIndex'];

    const monthIndex = this.dateIndicesObject['monthIndex'];

    // filters all workorders for
    // workorders in current month, year, and section
    const filteredWorkorders = this.workorders.filter(
      (workorder: IntWorkorder) => {
        const section: string = workorder.section.name;

        const workorderRaisedYear: number = dayjs(workorder.raised.dateTime).year();
        const workorderRaisedMonth: number = dayjs(workorder.raised.dateTime).month();

        return section === this.section && workorderRaisedYear === yearIndex && workorderRaisedMonth === monthIndex;
      }
    );

    // return obj
    let maintenanceCostsArray: number[] = [];


    filteredWorkorders.forEach(
      (workorder: IntWorkorder) => {
        const dateRaised: number = dayjs(workorder.raised.dateTime).date();

        if (date === dateRaised) {
          const spareCost = workorder.sparesUsed.status ? this.formatCostAsInteger(workorder.sparesUsed.totalCost) : 0;
          const spareCostInMillions = spareCost / 1000000;

          maintenanceCostsArray.push(spareCostInMillions)
        }
      }
    );

    return maintenanceCostsArray;
  }

  //for x-axis labels
  private constructLabelsArray(datesObject: { [key: string]: string[] }): string[] {
    let labelsArray: string[] = [];

    for (let key in datesObject) {

      if (key === this.week) {
        labelsArray = datesObject[key];
      }
    }

    return labelsArray;
  }

  // create the chart
  private createOneWeekPeriodChart(labels: string[], maintenanceCostsArray: number[]): Chart {
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

    // const tooltipPlugin = Chart.registry.getPlugin('tooltip') as any;
    // if (tooltipPlugin) {
    //   tooltipPlugin.positioners.customPositioner = this.customTooltipPositioner;

    // }

    const chart = new Chart(
      'mcOneSectionOneWeekPeriodChart',
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
              text: ['Daily Maintenance Costs',
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
                  return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
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
              // position: function (context) {

              //   const dataPointYValue = context?.tooltip?.dataPoints?.[0]?.parsed?.y;
              //   if (dataPointYValue) {
              //     const comparisonValue = 1.2 * maximumCost;
              //     const difference = comparisonValue - dataPointYValue;

              //     if (dataPointYValue === maximumCost) {
              //       // console.log('context', maximumCost);
              //       // console.log('keys', dataPointYValue);
              //       return 'customPositioner' as keyof TooltipPositionerMap;
              //     }
              //     return 'average';

              //   }

              //   return 'average';



              // },
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
                    return 'W/o No : cost';
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

  // generate and tie chart data together
  private generateMaintenanceCostForOneWeekPeriod(): void {
    if (this.workorders.length) {
      let maintenanceCostsArray: number[] = [];
      let labels: string[] = [];

      const datesObject: { [key: string]: string[] } = this.extractDatesInEachWeek();

      const datesLabelsArray: string[] = this.constructLabelsArray(datesObject);

      datesLabelsArray.forEach(
        (date: string) => {
          const workorders: number[] = this.filterWorkorders(date);

          const maintenanceCost: number = workorders.reduce(
            (finalCost: number, initialCost: number) => finalCost + initialCost, 0
          );

          labels.push(date);

          maintenanceCostsArray.push(maintenanceCost);
        }
      );

      if (this.chart) {
        this.chart.destroy();
      }

      this.chart = this.createOneWeekPeriodChart(labels, maintenanceCostsArray);

      if (this.chart) {
        this.updateChartPlotted.next(true);
      } else {
        this.updateChartPlotted.next(false);
        this.loadingDefaultError = `Plotting chart failed with error code MC-C-OWP-01. Please try reloading the page or report the error code if the issue persists.`;
      }
    }
    else {
      this.updateChartPlotted.next(false);
      this.loadingDefaultError = `Plotting chart failed with error code MC-C-OWP-02. This might happen when there was an issue loading workorders. Please try reloading the page or report the error code if the issue persists.`;

    }



  }

  private formatTooltipTitle(tooltipItem: any): string {
    if (tooltipItem && tooltipItem[0]) {
      const label = tooltipItem[0].label;

      // substr accepts only start index
      // index can be - or +
      const dateIndex = Number(label.substr(2).trim());

      const yearIndex = this.dateIndicesObject['yearIndex'];

      const monthIndex = this.dateIndicesObject['monthIndex'];

      const formattedDate = dayjs().year(yearIndex).month(monthIndex).date(dateIndex).format('ddd DD, MMM YY');

      return formattedDate;
    }
    return '';
  }

  // extracts workorders in each date
  // for tooltip in chart
  private extractTooltipLabels(tooltipItem: any): string[] {
    if (tooltipItem) {
      const date = tooltipItem.label;

      // substr accepts only start index
      // index can be - or +
      const datePart = Number(date.substr(2).trim());

      const yearIndex = this.dateIndicesObject['yearIndex'];

      const monthIndex = this.dateIndicesObject['monthIndex'];

      let workordersObject: string[] = [];

      // filters all workorders for
      // workorders in current month, year, and section
      const filteredWorkorders = this.workorders.filter(
        (workorder: IntWorkorder) => {
          const section: string = workorder.section.name;

          const workorderRaisedYear: number = dayjs(workorder.raised.dateTime).year();
          const workorderRaisedMonth: number = dayjs(workorder.raised.dateTime).month();

          return section === this.section && workorderRaisedYear === yearIndex && workorderRaisedMonth === monthIndex;
        }
      );

      filteredWorkorders.forEach(
        (workorder: IntWorkorder, index: number) => {
          const raised = dayjs(workorder.raised.dateTime).date();
          const workorderNumber = workorder.workorder.number;

          if (raised === datePart) {
            const spareCost = workorder.sparesUsed.status ? this.formatCostAsInteger(workorder.sparesUsed.totalCost) : 0;

            const spareCostInMillions = spareCost / 1000000;

            const formattedSpareCost = spareCostInMillions.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 4 });

            workordersObject.push(`${index + 1}. ${workorderNumber}: ${formattedSpareCost}`);
          }
        }
      );

      return workordersObject;
    }
    return [''];
  }

  private generateTooltipFooter(tooltipItems: any): string {
    if (tooltipItems && tooltipItems[0]) {
      let total = 0;
      let formattedTotal: string = '';

      const workorders = tooltipItems[0].length;

      if (workorders === 0) {
        return '';
      } else {

        tooltipItems.forEach(
          (tooltipItem: any) => {
            const cost = tooltipItem.parsed.y;
            total += cost;
            formattedTotal = total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 3 });

          }
        );

        return `Total: ${formattedTotal}`;
      }
    }

    return '';
  }

  // custom tooltip position
  // private customTooltipPositioner(elements: any, eventPosition: any): any {
  //   const { x, y: currentY } = eventPosition;


  //   const y = currentY + 10;

  //   return { x, y };
  // }
}
