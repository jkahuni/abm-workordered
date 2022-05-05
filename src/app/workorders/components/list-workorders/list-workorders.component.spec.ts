import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListWorkordersComponent } from './list-workorders.component';

describe('ListWorkordersComponent', () => {
  let component: ListWorkordersComponent;
  let fixture: ComponentFixture<ListWorkordersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListWorkordersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListWorkordersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
