import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';

// interfaces
import { IntWorkorder } from '@workorders/models/workorders.models';
import { IntSwitchChart, IntDateIndices, IntNameAndFormattedName } from '@reports/models/reports.models';

// rxjs
import { takeUntil, Subject } from 'rxjs';

// for chart
import { ChartConfiguration, ChartType, Chart } from 'chart.js';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import annotationPlugin from 'chartjs-plugin-annotation';

// dayjs
import * as dayjs from 'dayjs';

Chart.register(annotationPlugin);

@Component({
  selector: 'app-mc-multiple-sections-one-month-period',
  templateUrl: './mc-multiple-sections-one-month-period.component.html',
  styleUrls: ['./mc-multiple-sections-one-month-period.component.scss']
})
export class McMultipleSectionsOneMonthPeriodComponent implements OnInit, OnDestroy, OnChanges {

  constructor() {
    this.updateChartPlotted
      .pipe(takeUntil(this.onDestroy))
      .subscribe((status: boolean) => setTimeout(() => {
        this.chartPlotted.emit(status);
        setTimeout(() => {
          this.loading = false;
        }, 8)
        if (!status) {
          this.loadingFailed = true;
        }
      }));
  }

  @Input('workorders') allWorkorders!: IntWorkorder[];
  @Input('sections') selectedSections!: { name: string, formattedName: string }[];
  @Input('dateIndicesObject') selectedDateIndices!: IntDateIndices;

  @Output() chartPlotted: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() switchChart: EventEmitter<IntSwitchChart> = new EventEmitter<IntSwitchChart>();

  private onDestroy: Subject<void> = new Subject<void>();
  private updateChartPlotted: Subject<boolean> = new Subject<boolean>();

  sections!: IntNameAndFormattedName[];
  workorders!: IntWorkorder[];
  dateIndicesObject!: IntDateIndices;

  formattedDate!: string;

  // chart
  chart!: Chart;

  loading = true;
  loadingFailed = false;
  loadingDefaultError!: string;
  loadingFallbackError = `Plotting chart failed with error code U-MC-SPM-01. Please try reloading the page or report the error code if the issue persists.`;

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const workorders = changes['allWorkorders']?.currentValue;
    const sections = changes['selectedSections']?.currentValue;
    const dateIndicesObject = changes['selectedDateIndices']?.currentValue;

    this.workorders = workorders ? workorders : this.workorders;
    this.sections = sections ? sections : this.sections;
    this.dateIndicesObject = dateIndicesObject ? dateIndicesObject : this.dateIndicesObject;

    if (this.workorders && this.sections && this.dateIndicesObject) {
      this.generateFormattedTitleDate();
      this.generateMaintenanceCostForSectionsAndMonth();
    }
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  // transform TYPE name, formattedName 
  // to TYPE name
  private generateSectionName(formattedSectionName: string): string {
    const section = this.sections.filter((section: IntNameAndFormattedName ) => section.formattedName === formattedSectionName)
      .map((section: IntNameAndFormattedName) => section.name)
      .reduce((final, initial) => initial);
    return section;
  }

  private generateFormattedTitleDate(): string {
    const monthIndex = this.dateIndicesObject['monthIndex'];
    const yearIndex = this.dateIndicesObject['yearIndex'];

    this.formattedDate = dayjs().year(yearIndex).month(monthIndex).format('MMMM YY');

    return this.formattedDate;
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

  // returns maintenance cost
  private filterWorkordersInMonthAndSection(section: string): number[] {
    const maintenanceCost = this.workorders.filter(
      (workorder: IntWorkorder) => {
        const comparisonMonth = this.dateIndicesObject['monthIndex'];
        const comparisonYear = this.dateIndicesObject['yearIndex'];

        const workorderSection = workorder.section.name;

        const raised: dayjs.Dayjs = dayjs(workorder.raised.dateTime);
        const raisedYear = raised.year();
        const raisedMonth = raised.month();

        return workorderSection === section && raisedYear === comparisonYear && raisedMonth === comparisonMonth;
      }
    ).map((workorder: IntWorkorder) => {
      const cost = workorder.sparesUsed.status ?
        this.formatCostAsInteger(workorder.sparesUsed.totalCost) : 0;
      const costInMillions = cost / 1000000;
      return costInMillions;
    });

    return maintenanceCost;
  }

  // create chart object
  // returns the Chart object
  private createChart(labels: string[], maintenanceCostArray: number[]): Chart {
    const type: ChartType = 'bar';

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
    const chart = new Chart('mcMultipleSectionsOneMonthPeriodChart', {
      type,
      data,
      plugins: [DataLabelsPlugin],
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
            text: ['Sections Maintenance Costs', `${this.formattedDate
              }`]
          },
          datalabels: {
            display: 'auto',
            anchor: () => {
              return 'end';
            },

            align: () => {
              return 'top';
            },

            textAlign: 'center',

            formatter: function (value) {
              return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 3 });

            },
            color: 'black',
            offset: 5

          },

          // annotation: {
          //   annotations: [
          //     {
          //       type: 'line',
          //       scaleID: 'y',
          //       value: '2',
          //       // yMin: '2',
          //       // yMax: '2',
          //       borderColor: 'rgba(0,0,0,0.4)',
          //       borderWidth: 1,
          //       label: {
          //         position: 'end',
          //         enabled: true,
          //         color: 'white',
          //         content: 'Cost Limit',
          //         yAdjust: 0


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
              this.switchToOneSectionMultipleMonthsPeriod(section);
            }
          }

        }

      }
    });

    return chart;

  }

  // get workorders data
  private generateMaintenanceCostForSectionsAndMonth(): void {
    if (this.workorders.length) {
      // chart variables
      let sectionsLabels: string[] = [];
      let maintenanceCostArray: number[] = [];

      this.sections.forEach(
        (section: IntNameAndFormattedName) => {
          const sectionName = section['name'];
          const formattedSectionName = section['formattedName'];


          const maintenanceCost = this.filterWorkordersInMonthAndSection(sectionName)
            .reduce((finalCost: number, initialCost: number) => finalCost + initialCost, 0);

          sectionsLabels.push(formattedSectionName);
          maintenanceCostArray.push(maintenanceCost);

        });

      // destroy chart instance
      // allows reusing canvas
      if (this.chart) {
        this.chart.destroy();
      }

      this.chart = this.createChart(sectionsLabels, maintenanceCostArray);

      // updates loading status on parent
      if (this.chart) {
        this.updateChartPlotted.next(true);

      } else {
        this.updateChartPlotted.next(false);
        this.loadingDefaultError = `Plotting chart failed with error code MC-C-SPM-01. Please try reloading the page or report the error code if the issue persists.`;
      }
    }

    else {
      this.updateChartPlotted.next(false);
      this.loadingDefaultError = `Plotting chart failed with error code MC-C-SPM-02. Please try reloading the page or report the error code if the issue persists.`;
    }
  }

  // activate one month period chart
  private switchToOneSectionMultipleMonthsPeriod(section: string): void {
    const switchChartData: IntSwitchChart = {
      type: 'one-section-multiple-months-period',
      section: this.generateSectionName(section),
    };

    this.switchChart.emit(switchChartData);
  }
}
