import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkorderActionsComponent } from './workorder-actions.component';

describe('WorkorderActionsComponent', () => {
  let component: WorkorderActionsComponent;
  let fixture: ComponentFixture<WorkorderActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkorderActionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkorderActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
