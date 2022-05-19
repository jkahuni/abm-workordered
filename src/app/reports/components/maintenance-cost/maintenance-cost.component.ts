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
import { ChartConfiguration, ChartType, ChartData, ChartEvent } from 'chart.js';
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
    private resourcesService: ResourcesService
  ) { }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  @ViewChild('reportsChart') chart!: BaseChartDirective;

  private onDestroy = new Subject<void>();

  workorders!: IntWorkorder[];
  sections!: IntSection[];
  machines!: IntMachine[];

  // for chart config
  monthValues!: number[];
  workordersPerSectionPerMonth!: IntWorkorder[];
  sectionName!: string;


  // for bar chart
  public chartType: ChartType = 'line';
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
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

      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: this.generateChartTitle('title')
      },
      subtitle: {
        display: true,
        text: this.generateChartTitle('subtitle')
      },

      datalabels: {
        anchor: 'end',
        align: 'left'
      }
    }

  };
  public lineChartPlugins = [
    DataLabelsPlugin
  ];
  public lineChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      { data: [] },
    ]
  };


  ngOnInit(): void {
    this.sectionName = 'Some Name'
    this.getResources();
    this.getWorkorders();
    this.getMaintenanceCostsPerSection('Grid Casting');
  }

  private generateChartTitle(title: string): string {
    if(title = 'title'){
    return `${this.sectionName} Maintenance Costs`;}

    else { return this.sectionName; }
  }

  private getResources(resource?: string): void {
    if (resource) {
      if (resource === 'sections') {
        this.resourcesService.$sections
          .pipe(takeUntil(this.onDestroy))
          .subscribe(
            (sections: IntSection[] | null) => {
              if (sections) {
                this.sections = sections;
              } else {
                this.resourcesService.getSections()
                  .catch();
              }
            }
          );
      }

      else if (resource === 'machines') {
        this.resourcesService.$machines
          .pipe(takeUntil(this.onDestroy))
          .subscribe(
            (machines: IntMachine[] | null) => {
              if (machines) {
                this.machines = machines;
              } else {
                this.resourcesService.getMachines()
                  .catch();
              }
            }
          );
      }
    } else {
      this.resourcesService.$sections
        .pipe(takeUntil(this.onDestroy))
        .subscribe(
          (sections: IntSection[] | null) => {
            if (sections) {
              this.sections = sections;
            } else {
              this.resourcesService.getSections()
                .catch();
            }
          }
        );
    }
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

  getMaintenanceCostsPerSection(sectionName: string, workordersYear?: string): void {
    if (this.workorders) {
      console.log('SECTION NAME --> ', this.sectionName);

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

      this.monthValues.forEach(
        (month: number) => {
          const label = dayjs(dayjs().month(month)).format('MMM YY');
          const workorders = this.filterWorkordersForMonth(sectionsWorkorders, month, year).map((workorder: IntWorkorder) => {
            const totalSparesCost = workorder.sparesUsed.status ? this.formatCostAsInteger(workorder.sparesUsed.totalCost) : 0;

            return totalSparesCost;
          }).reduce((totalSparesCost: number, totalSpareCost: number) => {
            return totalSparesCost + totalSpareCost
          }, 0);
          monthsLabels.push(label);
          workordersDataArray.push(workorders);
        }
      );


      this.lineChartData.labels = monthsLabels;
      this.lineChartData.datasets[0].data = workordersDataArray;
      console.log('SECTION NAME --> ', this.sectionName);
      // this.chart?.update();
    }


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

  private filterWorkordersForMonth(workorders: IntWorkorder[], month: number, year: string): IntWorkorder[] {
    const filteredWorkorders = workorders.filter(
      (workorder: IntWorkorder) => {
        const workorderYear = dayjs(workorder.raised.dateTime).year();
        const workorderMonth = dayjs(workorder.raised.dateTime).month();

        return workorderYear === +year && workorderMonth === month;
      }
    );

    return filteredWorkorders;
  }
}
