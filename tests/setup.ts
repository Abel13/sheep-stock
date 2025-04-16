import '@testing-library/jest-dom';
import 'jest-canvas-mock';
import { cleanup } from '@testing-library/react-native';

afterEach(() => {
  cleanup();
});

// Mock Tamagui theme provider
jest.mock('@tamagui/core', () => ({
  ...jest.requireActual('@tamagui/core'),
  useTheme: () => ({
    background: '#FFFFFF',
    color: '#000000',
  }),
}));
