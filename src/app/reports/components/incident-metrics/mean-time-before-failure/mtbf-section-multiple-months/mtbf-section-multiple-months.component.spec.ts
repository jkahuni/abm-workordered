import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MtbfSectionMultipleMonthsComponent } from './mtbf-section-multiple-months.component';

describe('MtbfSectionMultipleMonthsComponent', () => {
  let component: MtbfSectionMultipleMonthsComponent;
  let fixture: ComponentFixture<MtbfSectionMultipleMonthsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MtbfSectionMultipleMonthsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MtbfSectionMultipleMonthsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
