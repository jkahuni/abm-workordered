import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupervisorsHandoverModalComponent } from './supervisors-handover-modal.component';

describe('SupervisorsHandoverModalComponent', () => {
  let component: SupervisorsHandoverModalComponent;
  let fixture: ComponentFixture<SupervisorsHandoverModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupervisorsHandoverModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SupervisorsHandoverModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
