import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { BootstrapStatusService } from './bootstrap-status.service';

describe('BootstrapStatusService', () => {
  it('maps the hasAdmin field from /api/public/bootstrap-status', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    const service = TestBed.inject(BootstrapStatusService);
    const httpMock = TestBed.inject(HttpTestingController);

    const result = firstValueFrom(service.hasAdmin());
    httpMock.expectOne('/api/public/bootstrap-status').flush({ hasAdmin: true });

    expect(await result).toBe(true);
  });
});
