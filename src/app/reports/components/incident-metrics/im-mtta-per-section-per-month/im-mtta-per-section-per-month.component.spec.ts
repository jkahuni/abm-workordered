import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImMttaPerSectionPerMonthComponent } from './im-mtta-per-section-per-month.component';

describe('ImMttaPerSectionPerMonthComponent', () => {
  let component: ImMttaPerSectionPerMonthComponent;
  let fixture: ComponentFixture<ImMttaPerSectionPerMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImMttaPerSectionPerMonthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImMttaPerSectionPerMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
