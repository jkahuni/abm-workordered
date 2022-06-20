import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddResourcesComponent } from './add-resources.component';

describe('AddResourcesComponent', () => {
  let component: AddResourcesComponent;
  let fixture: ComponentFixture<AddResourcesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddResourcesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
