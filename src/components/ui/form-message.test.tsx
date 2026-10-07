import { EMPTY_FORM_STATE, toFormState } from '@/utils/form';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormMessage } from './form-message';

describe('FormMessage', () => {
  it('announces an error message as an alert', () => {
    // Arrange
    const actionState = toFormState('ERROR', "We couldn't save this. Please try again.");

    // Act
    render(<FormMessage actionState={actionState} />);

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent("We couldn't save this. Please try again.");
  });

  it('keeps an empty alert region mounted when there is no message', () => {
    // Arrange & Act
    render(<FormMessage actionState={EMPTY_FORM_STATE} />);

    // Assert
    expect(screen.getByRole('alert')).toBeEmptyDOMElement();
  });
});
