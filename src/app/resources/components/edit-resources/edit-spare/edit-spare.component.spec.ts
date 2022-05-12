import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSpareComponent } from './edit-spare.component';

describe('EditSpareComponent', () => {
  let component: EditSpareComponent;
  let fixture: ComponentFixture<EditSpareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditSpareComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSpareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
