import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveMultipleSectionsComponent } from './approve-multiple-sections.component';

describe('ApproveMultipleSectionsComponent', () => {
  let component: ApproveMultipleSectionsComponent;
  let fixture: ComponentFixture<ApproveMultipleSectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproveMultipleSectionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveMultipleSectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
