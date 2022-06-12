import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MttrSectionOneMonthComponent } from './mttr-section-one-month.component';

describe('MttrSectionOneMonthComponent', () => {
  let component: MttrSectionOneMonthComponent;
  let fixture: ComponentFixture<MttrSectionOneMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MttrSectionOneMonthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MttrSectionOneMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
