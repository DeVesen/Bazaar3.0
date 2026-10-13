import { describe, expect, it } from 'vitest';
import { createResultEvent } from './result-event';

describe('createResultEvent', () => {
  it('createResultEvent_GivenKind_ReturnsEventWithThatKind', () => {
    // Arrange
    const kind = 'cart';

    // Act
    const event = createResultEvent(kind);

    // Assert
    expect(event.kind).toBe('cart');
  });

  it('createResultEvent_CalledTwiceWithSameKind_ReturnsDistinctEventsWithIncreasingId', () => {
    // Arrange
    const first = createResultEvent('failed');

    // Act
    const second = createResultEvent('failed');

    // Assert
    expect(second).not.toBe(first);
    expect(second.id).toBeGreaterThan(first.id);
  });
});
