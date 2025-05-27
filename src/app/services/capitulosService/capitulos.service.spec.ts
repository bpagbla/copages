import { TestBed } from '@angular/core/testing';

import { CapitulosService } from './capitulos.service';

describe('CapitulosService', () => {
  let service: CapitulosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CapitulosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
