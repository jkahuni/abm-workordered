import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneWeekPeriodComponent } from './one-week-period.component';

describe('OneWeekPeriodComponent', () => {
  let component: OneWeekPeriodComponent;
  let fixture: ComponentFixture<OneWeekPeriodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OneWeekPeriodComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OneWeekPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
