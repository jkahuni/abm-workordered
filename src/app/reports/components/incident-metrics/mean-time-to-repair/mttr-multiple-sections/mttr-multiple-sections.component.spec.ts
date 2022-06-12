import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MttrMultipleSectionsComponent } from './mttr-multiple-sections.component';

describe('MttrMultipleSectionsComponent', () => {
  let component: MttrMultipleSectionsComponent;
  let fixture: ComponentFixture<MttrMultipleSectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MttrMultipleSectionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MttrMultipleSectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
