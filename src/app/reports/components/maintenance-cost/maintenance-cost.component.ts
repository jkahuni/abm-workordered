import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';

// services
import { WorkordersService } from '@workorders/services/workorders.service';
import { ResourcesService } from '@resources/services/resources.service';

// interfaces
import { IntWorkorder } from '@workorders/models/workorders.models';
import { IntSection, IntMachine } from '@resources/models/resources.models';

// rxjs
import { Subject, takeUntil } from 'rxjs';

// for chart
import { ChartConfiguration, ChartType, ChartData, ChartEvent, Chart } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';

// dayjs
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-maintenance-cost',
  templateUrl: './maintenance-cost.component.html',
  styleUrls: ['./maintenance-cost.component.scss']
})
export class MaintenanceCostComponent implements OnInit, OnDestroy {

  constructor(
    private workordersService: WorkordersService,
    private resourcesService: ResourcesService,
  ) { }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  private onDestroy = new Subject<void>();

  workorders!: IntWorkorder[];
  sections!: IntSection[];
  machines!: IntMachine[];

  factorySections: string[] = ['Grid Casting', 'Sovema',
    'Pasting', 'Jar Formation', 'Assembly Line', 'IGO\'s', 'Acid Plant', 'Hygro Cubicles', 'Tank Formation'];

  // for chart config
  monthValues!: number[];
  workordersPerSectionPerMonth!: IntWorkorder[];
  section!: string;

  // chart
  chartObject!: Chart;


  // for bar chart
  public chartType: ChartType = 'line';
  public lineChartOptions!: ChartConfiguration['options'];
  public lineChartPlugins = [
    DataLabelsPlugin
  ];
  public lineChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        borderWidth: 1,
        backgroundColor: 'rgba(77,83,96,0.2)',
        borderColor: 'rgba(77,83,96,1)',
        pointBackgroundColor: 'rgba(77,83,96,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(77,83,96,1)',
        fill: 'origin',
      }
    ],

  };


  ngOnInit(): void {
    this.getWorkorders();
    this.generateMaintenanceCostPerSection('Grid Casting');
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

    const chart = new Chart('reportsChart', {
      type,
      data,
      plugins: [DataLabelsPlugin],
      options: {
        responsive: true,

        elements: type === 'line' ? {
          line: {
            tension: 0.5
          }
        } : {},

        scales: {
          x: {
            grid: {
              tickColor: 'blue'
            },
            ticks: {
              color: 'blue',
            },
            title: {
              color: 'blue',
              display: true,
              text: 'Months'
            }
          },
          y: {
            grid: {
              tickColor: 'blue'
            },
            ticks: {
              color: 'blue',
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
            anchor: 'end',
            align: 'left',
            textAlign: 'center',
            formatter: function (value) {
              if (+value === 0) {
                return '';
              } else {
                const roundedValue = ~~value;
                return roundedValue.toLocaleString('en-US', { minimumFractionDigits: 0 });
              }
            },
            color: function (context) {
              return context.dataIndex === 0 ? 'red' : 'blue';


            },
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

            const maintenanceCost = chart.data.datasets[point.datasetIndex].data[point.index];
            const monthYearLabel = chart.data.labels?.[point.index];

            console.log('cost', maintenanceCost);
            console.log('label', monthYearLabel);
          }

        }

      }
    });

    return chart;

  }

  private getWorkorders(): void {
    this.workordersService.$allWorkorders
      .pipe(takeUntil(this.onDestroy))
      .subscribe((workorders: IntWorkorder[] | null) => {
        if (workorders) {
          this.workorders = workorders;
        } else {
          this.workordersService.getAllWorkorders().catch();
        }
      });
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

            return total;
          }, 0);
          monthsLabels.push(label);
          workordersDataArray.push(workorders);
        }
      );

      if (this.chartObject) {
        this.chartObject.destroy();
      }
      this.chartObject = this.createChart('line', monthsLabels, workordersDataArray);
    }


  }

}
