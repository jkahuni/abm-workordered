import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderNumbersComponent } from './workorder-numbers.component';

describe('WorkorderNumbersComponent', () => {
  let component: WorkorderNumbersComponent;
  let fixture: ComponentFixture<WorkorderNumbersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkorderNumbersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderNumbersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
