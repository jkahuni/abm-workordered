import { Component, OnDestroy, OnInit, ViewChild, Input, OnChanges, Output, SimpleChanges , EventEmitter} from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';

// rxjs
import { takeUntil, Subject } from 'rxjs';

// services
import { WorkordersService } from '@workorders/services/workorders.service';

// interfaces
import { IntWorkorder } from '@workorders/models/workorders.models';
import { IntSection, IntMachine } from '@resources/models/resources.models';

// for chart
import { ChartConfiguration, ChartType, Chart } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';

// dayjs
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-maintenance-cost',
  templateUrl: './maintenance-cost.component.html',
  styleUrls: ['./maintenance-cost.component.scss']
})
export class MaintenanceCostComponent implements OnInit, OnDestroy, OnChanges {

  constructor(
    private workordersService: WorkordersService,
    public mediaMatcher: MediaMatcher,
  ) {

  }

  @Input('workorders') allWorkorders!: IntWorkorder[];
  @Input('section') currentSection!: string;

  @Output() chartPlotted: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  private onDestroy = new Subject<void>();
  private updateScreenProperties: Subject<any> = new Subject<any>();

  matcher!: MediaQueryList;

  workorders!: IntWorkorder[];
  sections!: IntSection[];
  machines!: IntMachine[];

  // for chart config
  monthValues!: number[];
  workordersPerSectionPerMonth!: IntWorkorder[];
  section!: string;

  // chart
  chartObject!: Chart;

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
    this.matcher.removeEventListener('change', this.mediaSizeListener);
  }

  ngOnInit(): void {
    // this.workorders = this.allWorkorders;
    this.matcher = this.mediaMatcher.matchMedia('(min-width: 500px)');
    this.matcher.addEventListener('change', this.mediaSizeListener);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const workorders = changes['allWorkorders']?.currentValue;
    const section = changes['currentSection']?.currentValue;

    this.workorders = workorders ? workorders : this.workorders;
    this.section = section ? section : this.section;

    this.generateMaintenanceCostPerSection(this.section);
    }

  private mediaSizeListener = (event: { matches: any }) => {
    this.updateScreenProperties.next(this.chartObject)
  }

  private createChart(type: ChartType, labels: string[], chartData: any[]): Chart {
    const data: ChartConfiguration['data'] = {
      labels,
      datasets: [
        {
          data: chartData,
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

    const maximumCost = Math.max(...chartData as number[]);

    Chart.defaults.font.family = 'Lato, "Open Sans", Arial, Helvetica, Noto, "Lucida Sans", sans-serif';
    Chart.defaults.font.size = 14;
    Chart.defaults.font.lineHeight = 1.4;
    const chart = new Chart('reportsChart', {
      type,
      data,
      plugins: [DataLabelsPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,

        elements: type === 'line' ? {
          line: {
            tension: 0.5
          }
        } : {},

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

                return currentPointData !== null && currentPointData === 0 ? 'end' : 'left';
              }
              else {
                const currentPointData = context.chart.data.datasets[contextIndex].data[pointIndex];
                return currentPointData ? 'top' : 'end';
              }
            },

            textAlign: 'center',

            formatter: function (value, context) {
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

            const maintenanceCost = chart.data.datasets[point.datasetIndex].data[point.index] as number;
            const monthYearLabel = chart.data.labels?.[point.index] as string;

            console.log('cost', maintenanceCost*1000000);
            console.log('label', monthYearLabel);
          }

        }

      }
    });

    return chart;

  }

  private generateMonthValues(months: number): number[] {
    const currentMonth = dayjs().month();
    let monthLabels: number[] = [];
    for (let i = months; i >= 0; i--) {
      const month = currentMonth - i;
      monthLabels.push(month);
    }


    return monthLabels;
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

  private filterMonthlyWorkorders(workorders: IntWorkorder[], month: number, year: string): IntWorkorder[] {
    const filteredWorkorders = workorders.filter(
      (workorder: IntWorkorder) => {
        const workorderYear = dayjs(workorder.raised.dateTime).year();
        const workorderMonth = dayjs(workorder.raised.dateTime).month();

        return workorderYear === +year && workorderMonth === month;
      }
    );

    return filteredWorkorders;
  }

  generateMaintenanceCostPerSection(sectionName: string, workordersYear?: string): void {
    if (this.workorders) {
      this.section = sectionName;
      const year = workordersYear || '2022';
      let monthsLabels: string[] = [];
      let workordersDataArray: number[] = [];
      this.monthValues = this.generateMonthValues(3);
      const sectionsWorkorders = this.workorders.filter(
        (workorder: IntWorkorder) => {
          const section = workorder.section.name;

          return section === sectionName;
        }
      );

      // get the mtnc costs per section per month
      this.monthValues.forEach(
        (month: number) => {
          const label = dayjs(dayjs().month(month)).format('MMM YY');
          const workorders = this.filterMonthlyWorkorders(sectionsWorkorders, month, year).map((workorder: IntWorkorder) => {
            const totalSparesCost = workorder.sparesUsed.status ? this.formatCostAsInteger(workorder.sparesUsed.totalCost) : 0;

            return totalSparesCost;
          }).reduce((totalSparesCost: number, totalSpareCost: number) => {
            const total = totalSparesCost + totalSpareCost;

            return total / 1000000;
          }, 0);
          monthsLabels.push(label);
          workordersDataArray.push(workorders);
        }
      );

      if (this.chartObject) {
        this.chartObject.destroy();
      }
      this.chartObject = this.createChart('line', monthsLabels, workordersDataArray);

      if (this.chartObject) {
        this.chartPlotted.emit(true);
      }
    }


  }
}