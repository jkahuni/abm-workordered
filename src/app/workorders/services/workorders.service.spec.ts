import { TestBed } from '@angular/core/testing';

import { WorkordersService } from './workorders.service';

describe('WorkordersService', () => {
  let service: WorkordersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkordersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
