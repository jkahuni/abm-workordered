import { Injectable } from '@angular/core';
import {
  IntSection, IntMachine, IntSpare, IntExpandedSection, IntExpandedMachine, IntExpandedSpare
} from '@resources/models/resources.models';
import { DocumentData, query, getDocs, collection, Firestore, orderBy, where, limit, doc, setDoc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResourcesService {

  constructor(private firestore: Firestore) { }

  private sections = new BehaviorSubject<IntSection[] | null>(null);
  private machines = new BehaviorSubject<IntMachine[] | null>(null);
  public $sections = this.sections.asObservable();
  public $machines = this.machines.asObservable();

  // get sections and machines
  async getSections(): Promise<IntSection[]> {
    const colRef = collection(this.firestore, 'sections');
    const sectionsQuery = query(colRef,
      orderBy('name'));

    const sectionsSnapshot = await getDocs(sectionsQuery);

    const sectionsArray = sectionsSnapshot?.docs.map((section: DocumentData) => {
      const uid = section['id'];
      const { name, id } = section['data']();
      const data = { uid, name, id } as IntSection;

      return data;
    }) as IntSection[];

    this.sections.next(sectionsArray);

    return sectionsArray;

  }

  async getMachines(): Promise<IntMachine[]> {
    const colRef = collection(this.firestore, 'machines');

    const machinesQuery = query(colRef,
      orderBy('name'));

    const machinesSnapshot = await getDocs(machinesQuery);

    const machinesArray = machinesSnapshot?.docs.map(
      (machine: any) => {
        const uid = machine['id'];
        const { name, id, section } = machine['data']();
        const data = { uid, name, id, section } as IntMachine;

        return data;
      }
    ) as IntMachine[];
    this.machines.next(machinesArray);
    return machinesArray;
  }

  // get spares
  async getSpares(searchValue: string): Promise<IntSpare[]> {
    const sparesColRef = collection(this.firestore, 'spares');
    const q = query(sparesColRef,
      orderBy('code'),
      where('searchParams', 'array-contains', searchValue),
      limit(5)
    );

    const querySnapshot = await getDocs(q);

    const sparesArray = querySnapshot?.docs.map((spare: any) => {
      const uid = spare['id'];
      const { code, name, unitCost, id } = spare.data();

      const data = { uid, code, name, unitCost, id } as IntSpare;

      return data;
    }) as IntSpare[];

    return sparesArray;
  }

  // add resource
  async addResource(col: string, ref: string,
    data: IntExpandedSection |
      IntExpandedMachine |
      IntExpandedSpare): Promise<any> {
    const docRef = doc(this.firestore, `${col}/${ref}`);

    const newResource = await setDoc(docRef, data);

    return newResource;

  }

  // update resource
  async updateResource(col: string, ref: string,
    data: IntExpandedSection |
      IntExpandedMachine |
      IntExpandedSpare): Promise<any> {
    const docRef = doc(this.firestore, `${col}/${ref}`);

    const updatedResource = await updateDoc(docRef, data as any);

    return updatedResource;
  }
}
