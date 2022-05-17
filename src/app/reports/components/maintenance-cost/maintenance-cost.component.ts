import { Component, OnInit } from '@angular/core';

// services
import { WorkordersService } from '@workorders/services/workorders.service';

// interfaces
import { IntWorkorder } from '@workorders/models/workorders.models';

// for chart
import { ChartOptions, ChartType, ChartDataset } from 'chart.js';


@Component({
  selector: 'app-maintenance-cost',
  templateUrl: './maintenance-cost.component.html',
  styleUrls: ['./maintenance-cost.component.scss']
})
export class MaintenanceCostComponent implements OnInit {

  constructor(
    private workordersService: WorkordersService
  ) { }

  workorders!: IntWorkorder[];

  // for bar chart
  barChartType: ChartType = 'bar';
  barChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Monthly Maintenance Costs'
      }
    },
    scales: {
      x: {
        grid: {
          tickColor: 'red'
        },
        ticks: {
          color: 'blue',
        },
        title: {
          color: 'red',
          display: true,
          text: 'Month'
        }
      },
      y: {
        grid: {
          tickColor: 'red'
        },
        ticks: {
          color: 'blue',
          
        },
        bounds: 'data',
        suggestedMin: 0,
        suggestedMax: 100
      
        
      }
    
    }

  };
  barChartLabels: string[] = ['Apr', 'May'];
  barChartLegend = true;
  barChartData: ChartDataset[] = [
    { data: [10, 15, 20, 25], label: 'label 1' },
    { data: [20, 25, 30, 35], label: 'label 2' }
  ];


  ngOnInit(): void {
    this.getWorkorders();
  }

  private getWorkorders = () => {
    this.workordersService.$allWorkorders.subscribe((workorders: IntWorkorder[] | null) => {
      if (workorders) {
        this.workorders = workorders;
      }
    });
  }

  public playAroundWithWorkorders = () => {
    if (this.workorders) {
      return this.workorders.map(
        (workorder) => {
          const totalSparesCost = workorder.sparesUsed.totalCost;
          const sectionName = workorder.section.name;
          console.log('totalSparesCost --> ', totalSparesCost);
          console.log('sectionName --> ', sectionName);
          return { totalSparesCost, sectionName };
        }
      );
    } return;
  }
}
