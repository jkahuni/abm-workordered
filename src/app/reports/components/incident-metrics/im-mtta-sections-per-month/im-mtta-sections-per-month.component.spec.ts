import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImMttaSectionsPerMonthComponent } from './im-mtta-sections-per-month.component';

describe('ImMttaSectionsPerMonthComponent', () => {
  let component: ImMttaSectionsPerMonthComponent;
  let fixture: ComponentFixture<ImMttaSectionsPerMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImMttaSectionsPerMonthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImMttaSectionsPerMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
