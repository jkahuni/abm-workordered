import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaiseConcernModalComponent } from './raise-concern-modal.component';

describe('RaiseConcernModalComponent', () => {
  let component: RaiseConcernModalComponent;
  let fixture: ComponentFixture<RaiseConcernModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RaiseConcernModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RaiseConcernModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
