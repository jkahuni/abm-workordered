import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeTechniciansModalComponent } from './change-technicians-modal.component';

describe('ChangeTechniciansModalComponent', () => {
  let component: ChangeTechniciansModalComponent;
  let fixture: ComponentFixture<ChangeTechniciansModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeTechniciansModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeTechniciansModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
