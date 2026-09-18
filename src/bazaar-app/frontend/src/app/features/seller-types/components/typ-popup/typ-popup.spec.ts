import { TestBed } from '@angular/core/testing';
import { TypPopup } from './typ-popup';

describe('TypPopup', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypPopup],
    }).compileComponents();
  });

  it('renders all three fields (name, commission rate, item fee)', async () => {
    const fixture = TestBed.createComponent(TypPopup);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'create');
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('input[name="name"]')).not.toBeNull();
    expect(compiled.querySelector('p-inputnumber[name="commissionRate"]')).not.toBeNull();
    expect(compiled.querySelector('p-inputnumber[name="itemFee"]')).not.toBeNull();
  });

  it('shows the static hint that changes do not apply retroactively to assigned sellers', async () => {
    const fixture = TestBed.createComponent(TypPopup);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'create');
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(
      'Änderungen wirken nicht rückwirkend auf bereits zugewiesene Verkäufer.',
    );
  });

  it('shows the create title in create mode and the edit title in edit mode', async () => {
    const fixture = TestBed.createComponent(TypPopup);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'create');
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Neuer Verkäufer-Typ');

    fixture.componentRef.setInput('mode', 'edit');
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Verkäufer-Typ bearbeiten',
    );
  });

  it('pre-fills name/commissionRate/itemFee in edit mode', async () => {
    const fixture = TestBed.createComponent(TypPopup);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('initialValue', {
      name: 'Standard',
      commissionRate: 12.5,
      itemFee: 0.5,
    });
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(component.name()).toBe('Standard');
    expect(component.commissionRate()).toBe(12.5);
    expect(component.itemFee()).toBe(0.5);
  });

  it('starts with empty/zero values in create mode', async () => {
    const fixture = TestBed.createComponent(TypPopup);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'create');
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(component.name()).toBe('');
    expect(component.commissionRate()).toBe(0);
    expect(component.itemFee()).toBe(0);
  });

  it('emits save with the trimmed name and current commissionRate/itemFee', async () => {
    const fixture = TestBed.createComponent(TypPopup);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('initialValue', {
      name: 'Standard',
      commissionRate: 12.5,
      itemFee: 0.5,
    });
    const component = fixture.componentInstance;
    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);
    await fixture.whenStable();

    component.name.set('  Premium  ');
    component.commissionRate.set(20);
    component.itemFee.set(1);
    component.onSave();

    expect(saveSpy).toHaveBeenCalledWith({ name: 'Premium', commissionRate: 20, itemFee: 1 });
  });

  it('does not emit save when the name is empty', async () => {
    const fixture = TestBed.createComponent(TypPopup);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'create');
    const component = fixture.componentInstance;
    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);
    await fixture.whenStable();

    component.name.set('   ');
    component.onSave();

    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('does not emit save while commissionRate is outside 0-100', async () => {
    const fixture = TestBed.createComponent(TypPopup);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'create');
    const component = fixture.componentInstance;
    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);
    await fixture.whenStable();

    component.name.set('Premium');
    component.commissionRate.set(150);
    component.onSave();

    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('does not emit save while itemFee is negative', async () => {
    const fixture = TestBed.createComponent(TypPopup);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'create');
    const component = fixture.componentInstance;
    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);
    await fixture.whenStable();

    component.name.set('Premium');
    component.itemFee.set(-1);
    component.onSave();

    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('does not emit save while saving is true', async () => {
    const fixture = TestBed.createComponent(TypPopup);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'create');
    fixture.componentRef.setInput('saving', true);
    const component = fixture.componentInstance;
    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);
    await fixture.whenStable();

    component.name.set('Premium');
    component.onSave();

    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('emits cancel and visibleChange(false) on cancel', async () => {
    const fixture = TestBed.createComponent(TypPopup);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'create');
    const component = fixture.componentInstance;
    const cancelSpy = vi.fn();
    const visibleChangeSpy = vi.fn();
    component.cancel.subscribe(cancelSpy);
    component.visibleChange.subscribe(visibleChangeSpy);
    await fixture.whenStable();

    component.onCancel();

    expect(cancelSpy).toHaveBeenCalled();
    expect(visibleChangeSpy).toHaveBeenCalledWith(false);
  });

  it('displays a server-side field error for commissionRate when provided', async () => {
    const fixture = TestBed.createComponent(TypPopup);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'create');
    fixture.componentRef.setInput('serverErrors', {
      commissionRate: 'Provision muss zwischen 0 und 100 liegen.',
    });
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Provision muss zwischen 0 und 100 liegen.');
  });
});
