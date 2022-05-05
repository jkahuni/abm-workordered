import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseCorrectiveMaintenanceComponent } from './close-corrective-maintenance.component';

describe('CloseCorrectiveMaintenanceComponent', () => {
  let component: CloseCorrectiveMaintenanceComponent;
  let fixture: ComponentFixture<CloseCorrectiveMaintenanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloseCorrectiveMaintenanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseCorrectiveMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
