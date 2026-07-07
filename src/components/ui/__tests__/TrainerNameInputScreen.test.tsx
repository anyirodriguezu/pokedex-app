import React from 'react';
import { act, fireEvent, waitFor } from '@testing-library/react-native';
import { render } from '../../../test-utils';
import { TrainerNameInputScreen } from '../TrainerNameInputScreen';
import { useTrainerStore } from '../../../store/trainerStore';

const mockOnFinish = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  useTrainerStore.setState({
    profile: null,
    step1Data: null,
    isEditing: false,
    activeTeam: [],
    box: [],
    hasSeenSplash: false,
    trainerName: null,
  });
});

describe('TrainerNameInputScreen', () => {
  it('renders the title text', async () => {
    const { getByText } = await render(<TrainerNameInputScreen onFinish={mockOnFinish} />);
    expect(getByText(/Cómo te llamas/)).toBeTruthy();
  });

  it('renders the submit button', async () => {
    const { getByText } = await render(<TrainerNameInputScreen onFinish={mockOnFinish} />);
    expect(getByText('¡Comenzar aventura!')).toBeTruthy();
  });

  it('button is disabled when input is empty', async () => {
    const { getByRole } = await render(<TrainerNameInputScreen onFinish={mockOnFinish} />);
    const button = getByRole('button', { name: 'Comenzar aventura' });
    expect(button.props.accessibilityState?.disabled || button.props.disabled).toBe(true);
  });

  it('calls setTrainerName and onFinish when a name is submitted', async () => {
    const { getByRole, getByPlaceholderText } = await render(
      <TrainerNameInputScreen onFinish={mockOnFinish} />
    );
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Ej: Ash Ketchum'), 'Ash');
    });
    fireEvent.press(getByRole('button', { name: 'Comenzar aventura' }));
    await waitFor(() => {
      expect(useTrainerStore.getState().trainerName).toBe('Ash');
      expect(mockOnFinish).toHaveBeenCalled();
    });
  });

  it('trims whitespace before saving the name', async () => {
    const { getByRole, getByPlaceholderText } = await render(
      <TrainerNameInputScreen onFinish={mockOnFinish} />
    );
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Ej: Ash Ketchum'), '  Ash  ');
    });
    fireEvent.press(getByRole('button', { name: 'Comenzar aventura' }));
    await waitFor(() => {
      expect(useTrainerStore.getState().trainerName).toBe('Ash');
    });
  });

  it('does not submit when name is only whitespace', async () => {
    const { getByRole, getByPlaceholderText } = await render(
      <TrainerNameInputScreen onFinish={mockOnFinish} />
    );
    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('Ej: Ash Ketchum'), '   ');
    });
    fireEvent.press(getByRole('button', { name: 'Comenzar aventura' }));
    await waitFor(() => {
      expect(mockOnFinish).not.toHaveBeenCalled();
    });
  });
});
