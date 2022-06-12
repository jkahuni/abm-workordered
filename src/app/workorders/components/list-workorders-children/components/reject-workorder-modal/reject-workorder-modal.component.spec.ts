import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectWorkorderModalComponent } from './reject-workorder-modal.component';

describe('RejectWorkorderModalComponent', () => {
  let component: RejectWorkorderModalComponent;
  let fixture: ComponentFixture<RejectWorkorderModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RejectWorkorderModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectWorkorderModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
