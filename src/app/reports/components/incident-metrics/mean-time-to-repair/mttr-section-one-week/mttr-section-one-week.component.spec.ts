import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MttrSectionOneWeekComponent } from './mttr-section-one-week.component';

describe('MttrSectionOneWeekComponent', () => {
  let component: MttrSectionOneWeekComponent;
  let fixture: ComponentFixture<MttrSectionOneWeekComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MttrSectionOneWeekComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MttrSectionOneWeekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
