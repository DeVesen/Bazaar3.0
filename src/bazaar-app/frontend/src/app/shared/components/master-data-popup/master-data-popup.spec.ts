import { TestBed } from '@angular/core/testing';
import { MasterDataPopup } from './master-data-popup';

describe('MasterDataPopup', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterDataPopup],
    }).compileComponents();
  });

  it('does not render the boolean-input toggle in create mode', async () => {
    const fixture = TestBed.createComponent(MasterDataPopup);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('entityLabel', 'Marke');
    fixture.componentRef.setInput('mode', 'create');
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-boolean-input')).toBeNull();
  });

  it('renders the boolean-input toggle and pre-fills name/original in edit mode', async () => {
    const fixture = TestBed.createComponent(MasterDataPopup);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('entityLabel', 'Marke');
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('initialValue', { name: 'Nike', original: true });
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-boolean-input')).not.toBeNull();
    expect(fixture.componentInstance.name()).toBe('Nike');
    expect(fixture.componentInstance.original()).toBe(true);
  });

  it('emits save with the trimmed name and current original value', async () => {
    const fixture = TestBed.createComponent(MasterDataPopup);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('entityLabel', 'Marke');
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('initialValue', { name: 'Nike', original: true });
    const component = fixture.componentInstance;
    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);
    await fixture.whenStable();

    component.name.set('  Adidas  ');
    component.onSave();

    expect(saveSpy).toHaveBeenCalledWith({ name: 'Adidas', original: true });
  });

  it('does not emit save when the name is empty', async () => {
    const fixture = TestBed.createComponent(MasterDataPopup);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('entityLabel', 'Marke');
    fixture.componentRef.setInput('mode', 'create');
    const component = fixture.componentInstance;
    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);
    await fixture.whenStable();

    component.name.set('   ');
    component.onSave();

    expect(saveSpy).not.toHaveBeenCalled();
  });
});
