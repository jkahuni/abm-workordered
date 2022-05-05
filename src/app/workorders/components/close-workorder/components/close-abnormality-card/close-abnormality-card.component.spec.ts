import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseAbnormalityCardComponent } from './close-abnormality-card.component';

describe('CloseAbnormalityCardComponent', () => {
  let component: CloseAbnormalityCardComponent;
  let fixture: ComponentFixture<CloseAbnormalityCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloseAbnormalityCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseAbnormalityCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
