import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'machinesFilter'
})
export class MachinesFilterPipe implements PipeTransform {

  transform(machines: any, selectedSection: any): any {
    if (!machines || !selectedSection) {
      return;
    }
    return machines.filter(
      (machine: any) => {
        const sectionId = +selectedSection.id;
        return sectionId === +(machine.section) ? machine : null;
      }
    );
  }

}
