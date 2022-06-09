import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleSectionsOneMonthComponent } from './multiple-sections-one-month.component';

describe('MultipleSectionsOneMonthComponent', () => {
  let component: MultipleSectionsOneMonthComponent;
  let fixture: ComponentFixture<MultipleSectionsOneMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultipleSectionsOneMonthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleSectionsOneMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
