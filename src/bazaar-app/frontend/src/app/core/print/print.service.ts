import { Injectable } from '@angular/core';

/** Data needed to print an Artikelannahme receipt (Round-17 Task 7's booking flow). */
export interface IntakeReceiptData {
  articleIds: string[];
  sellerId: string;
  feeAmount: number;
}

/**
 * Stub for the real print layout (Round-23) — deliberately does nothing beyond logging. The call
 * site in `intake-session-list` (`printIntakeReceipt()` after a successful booking) must not
 * change when the real implementation lands.
 */
@Injectable({ providedIn: 'root' })
export class PrintService {
  printIntakeReceipt(data: IntakeReceiptData): void {
    console.log('[PrintService] printIntakeReceipt', data);
  }
}
