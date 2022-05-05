import { Pipe, PipeTransform } from '@angular/core';
import { IntSection } from '@workorders/models/workorders.models';

@Pipe({
  name: 'sectionsFilter'
})
export class SectionsFilterPipe implements PipeTransform {
  transform(sections: any, workorderType: string): any {
    if (!sections || !workorderType) {
      return;
    }
    // few sections are casting, pasting, assembly, jar
    const toolChangeSections = [1, 3, 4, 5];
    const moldServiceSections = [1, 4, 5];
    // factory sections exclude distribution, offices, QA, and offices
    const factorySections = [13, 14, 15, 16];

    if (workorderType === 'Mold Service') {
      return sections.filter((section: IntSection) => moldServiceSections.includes(+section.id));

    } else if (workorderType === 'Tool Change') {
      return sections.filter((section: IntSection) => toolChangeSections.includes(+section.id));
    } else if (workorderType === 'Breakdown'
      || workorderType === 'Service'
      || workorderType === 'Corrective Maintenance'
      || workorderType === 'AM') {
      return sections.filter((section: IntSection) => !factorySections.includes(+section.id));
    }
    else {
      return sections;
    }

  }

}
