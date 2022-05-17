import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceCostComponent } from './maintenance-cost.component';

describe('MaintenanceCostComponent', () => {
  let component: MaintenanceCostComponent;
  let fixture: ComponentFixture<MaintenanceCostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaintenanceCostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintenanceCostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
