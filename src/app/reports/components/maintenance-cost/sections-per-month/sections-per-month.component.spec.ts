import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionsPerMonthComponent } from './sections-per-month.component';

describe('SectionsPerMonthComponent', () => {
  let component: SectionsPerMonthComponent;
  let fixture: ComponentFixture<SectionsPerMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SectionsPerMonthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SectionsPerMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
