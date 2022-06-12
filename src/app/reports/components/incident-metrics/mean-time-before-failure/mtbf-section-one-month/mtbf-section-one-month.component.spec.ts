import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MtbfSectionOneMonthComponent } from './mtbf-section-one-month.component';

describe('MtbfSectionOneMonthComponent', () => {
  let component: MtbfSectionOneMonthComponent;
  let fixture: ComponentFixture<MtbfSectionOneMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MtbfSectionOneMonthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MtbfSectionOneMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
