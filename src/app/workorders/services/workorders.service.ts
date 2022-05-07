import { Injectable } from '@angular/core';
import {
  Firestore, collection, getDocs,
  updateDoc, doc, getDoc, query,
  orderBy, where, limit, setDoc, DocumentData, Query
} from '@angular/fire/firestore';

import { IntMachine, IntSection, IntSpare, IntUser, IntWorkorder } from '@workorders/models/workorders.models';


@Injectable({
  providedIn: 'root'
})
export class WorkordersService {

  constructor(
    private firestore: Firestore,
  ) {
  }

  // get current user name and uid
  async getUser(userUid: string): Promise<IntUser> {
    const userDocRef = doc(this.firestore, 'users', userUid);

    const user = await getDoc(userDocRef);

    const { fullName, uid, group, technicianGroup, supervisorGroup
    } = user?.data() as IntUser;

    return { fullName, uid, group, technicianGroup, supervisorGroup };

  }

  // get all users group, technicianGroup, name, uid
  async getUsers(): Promise<IntUser[]> {
    const usersColRef = collection(this.firestore, 'users');
    const usersQuery = query(usersColRef, orderBy('fullName'),
      where('group', 'in', ['Technician', 'Supervisor']));

    const allUsersQuerySnapshot = await getDocs(usersQuery);

    const usersArray = allUsersQuerySnapshot?.docs.map(
      (user: DocumentData) => {
        const { fullName, uid, group, technicianGroup, supervisorGroup } = user['data']() as IntUser;

        return { fullName, uid, group, technicianGroup, supervisorGroup };
      }
    ) as IntUser[];

    return usersArray;
  }

  // used in raising workorders
  async getSections(): Promise<IntSection[]> {
    const colRef = collection(this.firestore, 'sections');
    const q = query(colRef, orderBy('name'));

    const querySnapshot = await getDocs(q);
    const sectionsArray = querySnapshot?.docs.map((section: any) => {
      const { name, id } = section.data() as IntSection;
      return { name, id };
    }) as IntSection[];

    return sectionsArray;
  }

  // used in raising workorders
  async getMachines(): Promise<IntMachine[]> {
    const colRef = collection(this.firestore, 'machines');
    const q = query(colRef, orderBy('name'));
    const querySnapshot = await getDocs(q);

    const machinesArray = querySnapshot?.docs.map((machine: any) => {
      const { name, id, section } = machine.data() as IntMachine;
      return { name, id, section };
    }) as IntMachine[];

    return machinesArray;
  }

  // used in closing workorder
  async getSpares(searchValue: string): Promise<IntSpare[]> {
    const sparesColRef = collection(this.firestore, 'spares');
    const q = query(sparesColRef,
      orderBy('code'),
      where('searchParams', 'array-contains', searchValue),
      limit(30)
    );

    const querySnapshot = await getDocs(q);

    const sparesArray = querySnapshot?.docs.map((spare: any) => {
      // deconstruct spaers object
      const { code, name, unitCost } = spare.data() as IntSpare;

      return { code, name, unitCost };
    }) as IntSpare[];
    return sparesArray;
  }

  // READ workorder => close || reject
  async getWorkorder(workorderUid: string): Promise<IntWorkorder> {
    const workordersCollection = collection(this.firestore, 'workorders');
    const workorderReference = doc(workordersCollection, `${workorderUid}`);

    const docSnapshot = await getDoc(workorderReference);

    const workorder = docSnapshot?.data() as IntWorkorder;
    return workorder;
  }

  // get all workorders -> unverified, open, closed, raised, approved, rejected
  async getWorkorders(workordersQuery: Query<DocumentData>): Promise<IntWorkorder[]> {

    const workordersQuerySnapshot = await getDocs(workordersQuery);

    const workordersArray = workordersQuerySnapshot?.docs.map(
      (workorder: DocumentData) => workorder['data']() as IntWorkorder
    ) as IntWorkorder[];
    return workordersArray;
  }

  // CREATE new workorder
  async raiseWorkorder(workorderData: IntWorkorder): Promise<any> {
    const uid = workorderData.workorder.uid;
    const docRef = doc(this.firestore, `workorders/${uid}`);

    const newWorkorder = await setDoc(docRef, workorderData);

    return newWorkorder;
  }

  // UPDATE workorder > approve, reject, acknowledge, done, close
  async updateWorkorder(workorderUid: string, workorderUpdateData: any): Promise<any> {
    const workorderRef = doc(this.firestore, `workorders/${workorderUid}`);
    const updatedWorkorder = await updateDoc(workorderRef, workorderUpdateData);

    return updatedWorkorder;
  }

}
