import { Injectable } from '@angular/core';

/** Data needed to print an Artikelannahme receipt (Round-17 Task 7's booking flow). */
export interface IntakeReceiptData {
  articleIds: string[];
  sellerId: string;
  feeAmount: number;
}

/** Data needed to print a seller's Abrechnungs-Beleg (Round-20 Task 6b's "Drucken" button). */
export interface SellerSummaryPrintData {
  sellerId: string;
  phase: 'preliminary' | 'final';
}

/**
 * Stub for the real print layout (Round-23 for `printIntakeReceipt`, Round-24 for
 * `printSellerSummary`) — deliberately does nothing beyond logging. The call sites in
 * `intake-session-list`/`release-dialog` (`printIntakeReceipt()`) and `settlement-page`
 * (`printSellerSummary()`) must not change when the real implementations land.
 */
@Injectable({ providedIn: 'root' })
export class PrintService {
  printIntakeReceipt(data: IntakeReceiptData): void {
    console.log('[PrintService] printIntakeReceipt', data);
  }

  printSellerSummary(data: SellerSummaryPrintData): void {
    console.log('[PrintService] printSellerSummary', data);
  }
}
