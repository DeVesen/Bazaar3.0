import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface SellerTypeDto {
  id: string;
  name: string;
  commissionRate: number;
  itemFee: number;
}

export interface ProfileDto {
  id: string;
  firstName: string;
  lastName: string;
  address: string | null;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  sellerType: SellerTypeDto;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  address: string | null;
  postalCode: string;
  city: string;
  phone: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileApiService {
  private readonly http = inject(HttpClient);

  getProfile(): Observable<ProfileDto> {
    return this.http.get<ProfileDto>('/api/profile');
  }

  updateProfile(payload: UpdateProfilePayload): Observable<ProfileDto> {
    return this.http.put<ProfileDto>('/api/profile', payload);
  }
}
