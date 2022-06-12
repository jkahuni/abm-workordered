import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcknowledgeMultipleSectionsComponent } from './acknowledge-multiple-sections.component';

describe('AcknowledgeMultipleSectionsComponent', () => {
  let component: AcknowledgeMultipleSectionsComponent;
  let fixture: ComponentFixture<AcknowledgeMultipleSectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcknowledgeMultipleSectionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcknowledgeMultipleSectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
