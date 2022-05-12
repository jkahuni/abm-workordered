import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSpareComponent } from './add-spare.component';

describe('AddSpareComponent', () => {
  let component: AddSpareComponent;
  let fixture: ComponentFixture<AddSpareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddSpareComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSpareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
