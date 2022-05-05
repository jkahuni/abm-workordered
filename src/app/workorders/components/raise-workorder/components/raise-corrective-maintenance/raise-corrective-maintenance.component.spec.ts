import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaiseCorrectiveMaintenanceComponent } from './raise-corrective-maintenance.component';

describe('RaiseCorrectiveMaintenanceComponent', () => {
  let component: RaiseCorrectiveMaintenanceComponent;
  let fixture: ComponentFixture<RaiseCorrectiveMaintenanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RaiseCorrectiveMaintenanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RaiseCorrectiveMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
