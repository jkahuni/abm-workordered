import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditResourcesComponent } from './edit-resources.component';

describe('EditResourcesComponent', () => {
  let component: EditResourcesComponent;
  let fixture: ComponentFixture<EditResourcesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditResourcesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditResourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
