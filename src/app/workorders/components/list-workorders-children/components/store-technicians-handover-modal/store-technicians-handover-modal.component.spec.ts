import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreTechniciansHandoverModalComponent } from './store-technicians-handover-modal.component';

describe('StoreTechniciansHandoverModalComponent', () => {
  let component: StoreTechniciansHandoverModalComponent;
  let fixture: ComponentFixture<StoreTechniciansHandoverModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StoreTechniciansHandoverModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreTechniciansHandoverModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
