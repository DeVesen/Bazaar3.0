import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VerkaeuferNummer } from './verkaeufer-nummer';

describe('VerkaeuferNummer', () => {
  let fixture: ComponentFixture<VerkaeuferNummer>;

  beforeEach(async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });

    await TestBed.configureTestingModule({
      imports: [VerkaeuferNummer],
      providers: [MessageService]
    }).compileComponents();
    fixture = TestBed.createComponent(VerkaeuferNummer);
    fixture.componentRef.setInput('sellerId', 'a3f9c2d1');
    fixture.detectChanges();
  });

  it('shows the sellerId in plain text', () => {
    expect(fixture.nativeElement.textContent).toContain('a3f9c2d1');
  });

  it('copies the sellerId and shows a toast on click', async () => {
    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');

    await fixture.componentInstance.copy();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('a3f9c2d1');
    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });
});
