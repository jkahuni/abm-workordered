import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignTechniciansModalComponent } from './assign-technicians-modal.component';

describe('AssignTechniciansModalComponent', () => {
  let component: AssignTechniciansModalComponent;
  let fixture: ComponentFixture<AssignTechniciansModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignTechniciansModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignTechniciansModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
