import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { render } from '../../../../test-utils';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TrainerStackParamList } from '../../../../navigation/types';
import { Step1PersonalDataScreen } from '../Step1PersonalDataScreen';
import { useTrainerStore } from '../../../../store/trainerStore';

type Step1NavProp = NativeStackNavigationProp<TrainerStackParamList, 'Step1PersonalData'>;

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useFocusEffect: () => {},
}));
jest.mock('expo-haptics');

const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() } as unknown as Step1NavProp;
const mockRoute = { params: {} } as unknown as RouteProp<TrainerStackParamList, 'Step1PersonalData'>;

const renderScreen = () =>
  render(
    <Step1PersonalDataScreen
      navigation={mockNavigation}
      route={mockRoute}
    />
  );

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

describe('Step1PersonalDataScreen — renderizado', () => {
  it('muestra los tres campos del formulario', async () => {
    const { getByPlaceholderText } = await renderScreen();
    expect(getByPlaceholderText('Ej: Ash Ketchum')).toBeTruthy();
    expect(getByPlaceholderText('Ej: 10')).toBeTruthy();
    expect(getByPlaceholderText('Ej: ash@pokemon.com')).toBeTruthy();
  });

  it('muestra el título y el botón de avance', async () => {
    const { getByText } = await renderScreen();
    expect(getByText('Datos Personales')).toBeTruthy();
    expect(getByText('Siguiente')).toBeTruthy();
  });
});

describe('Step1PersonalDataScreen — flujo completo', () => {
  it('guarda datos en el store y navega a Step2 al enviar un formulario válido', async () => {
    const { getByPlaceholderText, getByText } = await renderScreen();
    fireEvent.changeText(getByPlaceholderText('Ej: Ash Ketchum'), 'Ash Ketchum');
    fireEvent.changeText(getByPlaceholderText('Ej: 10'), '10');
    fireEvent.changeText(getByPlaceholderText('Ej: ash@pokemon.com'), 'ash@pokemon.com');
    fireEvent.press(getByText('Siguiente'));
    await waitFor(() => {
      expect(useTrainerStore.getState().step1Data).toEqual({
        fullName: 'Ash Ketchum',
        age: 10,
        email: 'ash@pokemon.com',
      });
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Step2Preferences', { mode: 'create' });
    });
  });
});
