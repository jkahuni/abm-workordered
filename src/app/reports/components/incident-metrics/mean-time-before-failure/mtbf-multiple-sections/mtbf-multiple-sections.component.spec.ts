import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MtbfMultipleSectionsComponent } from './mtbf-multiple-sections.component';

describe('MtbfMultipleSectionsComponent', () => {
  let component: MtbfMultipleSectionsComponent;
  let fixture: ComponentFixture<MtbfMultipleSectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MtbfMultipleSectionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MtbfMultipleSectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
