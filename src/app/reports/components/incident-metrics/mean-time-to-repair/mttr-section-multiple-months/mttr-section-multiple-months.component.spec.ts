import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MttrSectionMultipleMonthsComponent } from './mttr-section-multiple-months.component';

describe('MttrSectionMultipleMonthsComponent', () => {
  let component: MttrSectionMultipleMonthsComponent;
  let fixture: ComponentFixture<MttrSectionMultipleMonthsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MttrSectionMultipleMonthsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MttrSectionMultipleMonthsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
