import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneSectionMultipleMonthsPeriodComponent } from './one-section-multiple-months-period.component';

describe('OneSectionMultipleMonthsPeriodComponent', () => {
  let component: OneSectionMultipleMonthsPeriodComponent;
  let fixture: ComponentFixture<OneSectionMultipleMonthsPeriodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OneSectionMultipleMonthsPeriodComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OneSectionMultipleMonthsPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
