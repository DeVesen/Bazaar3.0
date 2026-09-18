import { TestBed } from '@angular/core/testing';
import { BooleanInput } from './boolean-input';

describe('BooleanInput', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BooleanInput],
    }).compileComponents();
  });

  it('defaults to the switch variant', async () => {
    const fixture = TestBed.createComponent(BooleanInput);
    fixture.componentRef.setInput('label', 'Original');
    await fixture.whenStable();

    expect(fixture.componentInstance.variant()).toBe('switch');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p-toggleswitch')).not.toBeNull();
    expect(compiled.querySelector('p-checkbox')).toBeNull();
  });

  it('renders the checkbox variant when requested', async () => {
    const fixture = TestBed.createComponent(BooleanInput);
    fixture.componentRef.setInput('label', 'Marken einschließen');
    fixture.componentRef.setInput('variant', 'checkbox');
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p-checkbox')).not.toBeNull();
    expect(compiled.querySelector('p-toggleswitch')).toBeNull();
  });

  it('emits valueChange with the new boolean on toggle', async () => {
    const fixture = TestBed.createComponent(BooleanInput);
    fixture.componentRef.setInput('label', 'Original');
    const component = fixture.componentInstance;
    const valueChangeSpy = vi.fn();
    component.valueChange.subscribe(valueChangeSpy);
    await fixture.whenStable();

    component.onToggle(true);

    expect(valueChangeSpy).toHaveBeenCalledWith(true);
  });

  it('renders the label text', async () => {
    const fixture = TestBed.createComponent(BooleanInput);
    fixture.componentRef.setInput('label', 'Original');
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Original');
  });
});
