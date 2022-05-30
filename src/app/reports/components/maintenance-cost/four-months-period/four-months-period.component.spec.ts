import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FourMonthsPeriodComponent } from './four-months-period.component';

describe('FourMonthsPeriodComponent', () => {
  let component: FourMonthsPeriodComponent;
  let fixture: ComponentFixture<FourMonthsPeriodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FourMonthsPeriodComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FourMonthsPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
