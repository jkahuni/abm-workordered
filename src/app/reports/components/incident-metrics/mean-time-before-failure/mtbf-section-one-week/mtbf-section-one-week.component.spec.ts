import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MtbfSectionOneWeekComponent } from './mtbf-section-one-week.component';

describe('MtbfSectionOneWeekComponent', () => {
  let component: MtbfSectionOneWeekComponent;
  let fixture: ComponentFixture<MtbfSectionOneWeekComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MtbfSectionOneWeekComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MtbfSectionOneWeekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
