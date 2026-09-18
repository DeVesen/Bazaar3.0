import { TestBed } from '@angular/core/testing';
import { IntakeStepTwoPlaceholder } from './intake-step-two-placeholder';

describe('IntakeStepTwoPlaceholder', () => {
  it('renders the given sellerId', async () => {
    await TestBed.configureTestingModule({
      imports: [IntakeStepTwoPlaceholder],
    }).compileComponents();

    const fixture = TestBed.createComponent(IntakeStepTwoPlaceholder);
    fixture.componentRef.setInput('sellerId', 'SEL00042');
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('SEL00042');
  });
});
