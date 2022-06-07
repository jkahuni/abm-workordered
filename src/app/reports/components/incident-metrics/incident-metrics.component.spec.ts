import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentMetricsComponent } from './incident-metrics.component';

describe('IncidentMetricsComponent', () => {
  let component: IncidentMetricsComponent;
  let fixture: ComponentFixture<IncidentMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncidentMetricsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncidentMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
