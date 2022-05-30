import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneMonthPeriodComponent } from './one-month-period.component';

describe('OneMonthPeriodComponent', () => {
  let component: OneMonthPeriodComponent;
  let fixture: ComponentFixture<OneMonthPeriodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OneMonthPeriodComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OneMonthPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
