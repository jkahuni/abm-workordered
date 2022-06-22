import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { IntWorkorder, IntSparesUsed, IntSpareWithQuantities } from '@workorders/models/workorders.models';
import { WorkordersService } from '@workorders/services/workorders.service';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-stock-sheet',
  templateUrl: './stock-sheet.component.html',
  styleUrls: ['./stock-sheet.component.scss']
})
export class StockSheetComponent implements OnInit {
  @ViewChild(MatTable) stockSheetTable!: MatTable<any>;

  sparesUsed!: IntSparesUsed[];
  allSpares!: any[];

  // for table
  displayedColumns: string[] = ['No', 'code', 'name', 'unitCost', 'totalCost', 'totalCount'];
  dataSource!: any[];


  constructor(
    private workordersService: WorkordersService
  ) { }

  ngOnInit(): void {
    this.getAllSpares();
  }

  private getAllSpares(): any {
    this.workordersService.$allWorkorders.subscribe(
      (workorders: IntWorkorder[] | null) => {
        if (workorders) {
          const currentMonth = dayjs().month();
          let viableWorkorders: IntWorkorder[] = [];
          for (let workorder of workorders) {
            const raised = dayjs(workorder.raised.dateTime).month();
            if (raised === currentMonth) {
              viableWorkorders.push(workorder);
            }
          }
          this.generateDataSource(viableWorkorders);

        } else {
          this.workordersService.getAllWorkorders();
        }
      }
    );

  }

  // generate data source
  private generateDataSource(workorders: IntWorkorder[]): any {
    // get spares used
    const sparesArray = workorders.map((workorder: IntWorkorder) => {
      return workorder.sparesUsed.spares.map(
        (spare: IntSpareWithQuantities) => {
          if (spare) {
            const totalCostString: string = `${spare.totalCost}`;
            const formattedTotalCost = totalCostString.toString().replace(/[KSh\s,]+/g, '');
            return { ...spare, totalCost: +formattedTotalCost } as IntSpareWithQuantities;

          }
          return {} as IntSpareWithQuantities;
        }
      );

    });

    // first time, group into codes
    const reducedSparesArray = sparesArray.reduce(
      (
        groupedSpares: IntSpareWithQuantities[],
        spares: IntSpareWithQuantities[] | []
      ) => {

        for (let spare of spares) {
          const code = spare.code;
          const spareExists = groupedSpares.find((spare: IntSpareWithQuantities) => spare.code === code);

          if (spareExists) {
            let spareExistsQuantity = +spareExists.quantity;
            let spareQuantity = +spare.quantity;
            const totalQuantity = spareExistsQuantity += spareQuantity;
            spareExists.quantity = totalQuantity;

            let spareExistsCost = +spareExists.totalCost;
            let spareCost = +spare.totalCost;
            const totalCost = spareExistsCost += spareCost;
            spareExists.totalCost = totalCost;

          }
          else {
            groupedSpares.push(spare);
          }
        }


        return groupedSpares;
      },
      []);

    const dataSource = reducedSparesArray.map(
      (spare: IntSpareWithQuantities) => {
        const totalCost = spare.totalCost;
        const formattedTotalCost = totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        return { ...spare, totalCost: formattedTotalCost } as IntSpareWithQuantities;
      }
    ).sort((a, b) => a.code.localeCompare(b.code));
    this.dataSource = dataSource;
  }

  calculateTotalSparesCost(code: string): any {
    const spares = this.allSpares.filter((spare: any) => {
      return spare.code === code;
    })
      .map((spare: any) => spare.totalCost)
      .reduce((final, initial) => final + initial, 0);

    return spares;
  }

  calculateTotalSpares(code: string): any {
    const spares = this.allSpares.filter((spare: any) => spare.code === code);
    return spares.length;
  }

}
