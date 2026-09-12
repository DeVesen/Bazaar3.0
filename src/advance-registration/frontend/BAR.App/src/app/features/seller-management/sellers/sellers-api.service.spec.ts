import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SellersApiService } from './sellers-api.service';

describe('SellersApiService', () => {
  let service: SellersApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), SellersApiService] });
    service = TestBed.inject(SellersApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list() builds the query string from search/page/pageSize/sort', () => {
    service.list({ search: 'anna', page: 2, pageSize: 25, sort: 'lastName:asc' }).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === '/api/sellers' && r.params.get('search') === 'anna' && r.params.get('page') === '2' && r.params.get('sort') === 'lastName:asc'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ items: [], totalCount: 0, page: 2, pageSize: 25 });
  });

  it('list() omits search and sort params when not provided', () => {
    service.list({ page: 1, pageSize: 10 }).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === '/api/sellers' && r.params.get('page') === '1' && r.params.get('pageSize') === '10'
    );
    expect(req.request.params.has('search')).toBe(false);
    expect(req.request.params.has('sort')).toBe(false);
    req.flush({ items: [], totalCount: 0, page: 1, pageSize: 10 });
  });

  it('create() posts a new seller', () => {
    service
      .create({
        firstName: 'Anna',
        lastName: 'Muster',
        postalCode: '12345',
        city: 'Musterstadt',
        phone: '0123456789',
        email: 'anna@example.com',
        sellerTypeId: 'st1'
      })
      .subscribe();

    const req = httpMock.expectOne('/api/sellers');
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('update() puts to the seller resource', () => {
    service
      .update('s1', {
        firstName: 'Anna',
        lastName: 'Muster',
        postalCode: '12345',
        city: 'Musterstadt',
        phone: '0123456789',
        email: 'anna@example.com',
        sellerTypeId: 'st1'
      })
      .subscribe();

    const req = httpMock.expectOne('/api/sellers/s1');
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('delete() sends DELETE to the seller resource', () => {
    service.delete('s1').subscribe();

    const req = httpMock.expectOne('/api/sellers/s1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('invite() posts to the invite endpoint', () => {
    service.invite('s1').subscribe();

    const req = httpMock.expectOne('/api/sellers/s1/invite');
    expect(req.request.method).toBe('POST');
    req.flush({ inviteUrl: 'https://x/set-password?token=t', expiresAt: '2026-08-24T12:00:00+02:00' });
  });

  it('nextFreeStartNumber() gets the next free block start number', () => {
    service.nextFreeStartNumber(3).subscribe();

    const req = httpMock.expectOne((r) => r.url === '/api/blocks/next-free' && r.params.get('blockCount') === '3');
    expect(req.request.method).toBe('GET');
    req.flush({ startNumber: 100 });
  });

  it('reserveBlocks() posts to the nested blocks route', () => {
    service.reserveBlocks('s1', { startNumber: 100, blockCount: 2 }).subscribe();

    const req = httpMock.expectOne('/api/sellers/s1/blocks');
    expect(req.request.method).toBe('POST');
    req.flush([]);
  });

  it('deleteBlock() sends DELETE to the nested block route', () => {
    service.deleteBlock('s1', 'b1').subscribe();

    const req = httpMock.expectOne('/api/sellers/s1/blocks/b1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getBlocks() gets the blocks for one seller', () => {
    service.getBlocks('s1').subscribe();

    const req = httpMock.expectOne('/api/sellers/s1/blocks');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
