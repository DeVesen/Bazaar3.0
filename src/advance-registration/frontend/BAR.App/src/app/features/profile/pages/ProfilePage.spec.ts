import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProfilePage } from './ProfilePage';

const PROFILE = {
  id: 'a3f9c2d1', firstName: 'Anna', lastName: 'Beispiel', address: 'Hauptstr. 1',
  postalCode: '76133', city: 'Karlsruhe', phone: '0721 12345', email: 'anna@example.com',
  sellerType: { id: 't1', name: 'Standard', commissionRate: 15, itemFee: 0.5 }
};

describe('ProfilePage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    vi.stubGlobal('ResizeObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });

    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [provideHttpClient(), provideHttpClientTesting(), MessageService]
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads the profile and pre-fills the form', () => {
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    httpMock.expectOne('/api/profile').flush(PROFILE);
    fixture.detectChanges();

    expect(fixture.componentInstance.firstName()).toBe('Anna');
    expect(fixture.nativeElement.textContent).toContain('Standard');
  });

  it('saves successfully and shows a toast', () => {
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    httpMock.expectOne('/api/profile').flush(PROFILE);
    fixture.detectChanges();

    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');

    fixture.componentInstance.save();
    const putReq = httpMock.expectOne('/api/profile');
    expect(putReq.request.method).toBe('PUT');
    putReq.flush({ ...PROFILE, city: 'Stuttgart' });

    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('shows field errors on 400 and keeps entered values', () => {
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    httpMock.expectOne('/api/profile').flush(PROFILE);
    fixture.detectChanges();

    fixture.componentInstance.city.set('Freiburg');
    fixture.componentInstance.save();
    const putReq = httpMock.expectOne('/api/profile');
    putReq.flush({ errors: { city: ['Ort ist ein Pflichtfeld.'] } }, { status: 400, statusText: 'Bad Request' });

    expect(fixture.componentInstance.fieldErrors()['city']).toEqual(['Ort ist ein Pflichtfeld.']);
    expect(fixture.componentInstance.city()).toBe('Freiburg');
  });

  it('disables saving when a required field is empty', () => {
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    httpMock.expectOne('/api/profile').flush(PROFILE);
    fixture.detectChanges();

    fixture.componentInstance.city.set('');

    expect(fixture.componentInstance.canSave()).toBe(false);
  });
});
