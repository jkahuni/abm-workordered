import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';

// interfaces
import { IntWorkorder } from '@workorders/models/workorders.models';
import { IntSwitchChart } from '@reports/models/reports.models';

// rxjs
import { takeUntil, Subject } from 'rxjs';

// for chart
import { ChartConfiguration, ChartType, Chart } from 'chart.js';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';

// dayjs
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-sections-per-month',
  templateUrl: './sections-per-month.component.html',
  styleUrls: ['./sections-per-month.component.scss']
})
export class SectionsPerMonthComponent implements OnInit, OnDestroy, OnChanges {

  constructor() {
    this.updateChartPlotted
      .pipe(takeUntil(this.onDestroy))
      .subscribe((status: boolean) => setTimeout(() => {
        this.chartPlotted.emit(status);
      }));
  }

  @Input('workorders') allWorkorders!: IntWorkorder[];
  @Input('sections') selectedSections!: { name: string, formattedName: string }[];
  @Input('month') selectedMonth!: string;

  @Output() chartPlotted: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() switchChart: EventEmitter<IntSwitchChart> = new EventEmitter<IntSwitchChart>();

  private onDestroy: Subject<void> = new Subject<void>();
  private updateChartPlotted: Subject<boolean> = new Subject<boolean>();

  sections!: { name: string, formattedName: string }[];
  workorders!: IntWorkorder[];
  month!: string;
  formattedMonth!: string;

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
    const month = changes['selectedMonth']?.currentValue;

    this.workorders = workorders ? workorders : this.workorders;
    this.sections = sections ? sections : this.sections;
    this.month = month ? month : this.month;

    if (this.workorders && this.sections && this.month) {
      this.generateMaintenanceCostForSectionsAndMonth();
    }
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  private generateSectionName(formattedSectionName: string): string {
    const section = this.sections.filter((section: { name: string, formattedName: string }) => section.formattedName === formattedSectionName)
      .map((section: { name: string, formattedName: string }) => section.name)
      .reduce((final, initial) => initial);
    return section;
  }

  private getMonthAndYearIndices(): { month: number, year: number } {
    const monthPart = this.month.slice(0, -2);
    const yearPart = this.month.slice(-2);
    const dateString = monthPart + ' 20' + yearPart;
    const month = dayjs(dateString).month();
    const year = dayjs(dateString).year();
    const dateObject = { month, year };

    this.formattedMonth = dayjs(dateString).format('MMMM YYYY');
    return dateObject;
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
        const dateObject = this.getMonthAndYearIndices();
        const comparisonMonth = dateObject['month'];
        const comparisonYear = dateObject['year'];

        const workorderSection = workorder.section.name;

        const raised: dayjs.Dayjs = dayjs(workorder.raised.dateTime);
        const raisedYear = raised.year();
        const raisedMonth = raised.month();

        return workorderSection === section && raisedYear === comparisonYear && raisedMonth === comparisonMonth;
      }
    ).map((workorder: IntWorkorder) => {
      const cost = workorder.sparesUsed.status ?
        this.formatCostAsInteger(workorder.sparesUsed.totalCost) : 0;
      return cost / 1000000;
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
    const chart = new Chart('sectionsPerMonthChart', {
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
            text: ['Sectional Maintenance Costs', `${this.formattedMonth
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
              return value.toLocaleString('en-US', { minimumFractionDigits: 0 });

            },
            color: 'black',
            offset: 5

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
              const section = chart.data.labels?.[point.index] as string;
              const sectionalData = { cost, section };
              this.activateOneMonthPeriodChart(sectionalData);
            }
          }

        }

      }
    });

    return chart;

  }

  // get workorders data
  private generateMaintenanceCostForSectionsAndMonth(): void {
    if (this.workorders.length > 0) {
      // chart variables
      let sectionsLabels: string[] = [];
      let maintenanceCostArray: number[] = [];

      this.sections.forEach(
        (section: { name: string, formattedName: string }) => {
          const sectionName = section['name'];
          const formattedSectionName = section['formattedName'];

          const maintenanceCost = this.filterWorkordersInMonthAndSection(sectionName)
            .reduce((finalCost: number, initialCost: number) => finalCost + initialCost, 0);

          sectionsLabels.push(formattedSectionName);
          maintenanceCostArray.push(maintenanceCost);

        });

      if (this.chart) {
        this.chart.destroy();
      }

      this.chart = this.createChart(sectionsLabels, maintenanceCostArray);

      if (this.chart) {
        this.updateChartPlotted.next(true);
        setTimeout(() => { (this.loading = false) }, 15);
      } else {
        this.updateChartPlotted.next(false);
        this.loading = false;
        this.loadingFailed = true;
        this.loadingDefaultError = `Plotting chart failed with error code MC-C-SPM-01. Please try reloading the page or report the error code if the issue persists.`;
      }
    }

    else {
      this.loadingFailed = true;
      this.loadingDefaultError = `Plotting chart failed with error code MC-C-SPM-02. Please try reloading the page or report the error code if the issue persists.`;
    }
  }

  // activate one month period chart
  private activateOneMonthPeriodChart({ cost, section }: { section: string, cost: number }): void {
    const data: IntSwitchChart = {
      type: 'one-month-period',
      section: this.generateSectionName(section),
      month: this.month,
      cost
    };

    this.switchChart.emit(data);
  }

}
