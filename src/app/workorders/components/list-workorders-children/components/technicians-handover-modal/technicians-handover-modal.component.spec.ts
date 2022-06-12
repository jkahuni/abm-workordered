import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechniciansHandoverModalComponent } from './technicians-handover-modal.component';

describe('TechniciansHandoverModalComponent', () => {
  let component: TechniciansHandoverModalComponent;
  let fixture: ComponentFixture<TechniciansHandoverModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TechniciansHandoverModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TechniciansHandoverModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
