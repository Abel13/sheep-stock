// Setup window and matchMedia before any imports
if (typeof window === 'undefined') {
  (global as any).window = {};
}

if (typeof window.matchMedia === 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

import '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import { cleanup } from '@testing-library/react-native';

// Setup navigator if not available
if (typeof navigator === 'undefined') {
  (global as any).navigator = {
    product: 'ReactNative',
  };
}

// Mock Settings
jest.mock('react-native/Libraries/Settings/Settings', () => ({
  get: jest.fn(),
  set: jest.fn(),
}));

// Mock react-native
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  // Mock Settings Manager
  RN.NativeModules.SettingsManager = {
    settings: {
      AppleLocale: 'en_US',
      AppleLanguages: ['en'],
    },
  };

  return {
    ...RN,
    Platform: {
      ...RN.Platform,
      OS: 'ios',
      select: jest.fn(x => x.ios),
    },
    NativeModules: {
      ...RN.NativeModules,
      SettingsManager: RN.NativeModules.SettingsManager,
    },
    Animated: {
      ...RN.Animated,
      timing: () => ({
        start: jest.fn(),
      }),
      spring: () => ({
        start: jest.fn(),
      }),
      Value: jest.fn(() => ({
        setValue: jest.fn(),
        interpolate: jest.fn(),
      })),
      createAnimatedComponent: jest.fn(component => component),
      event: jest.fn(),
      add: jest.fn(),
      multiply: jest.fn(),
    },
  };
});

// Mock Tamagui theme provider
jest.mock('@tamagui/core', () => ({
  ...jest.requireActual('@tamagui/core'),
  useTheme: () => ({
    background: '#FFFFFF',
    color: '#000000',
  }),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock expo constants
jest.mock('expo-constants', () => ({
  Constants: {
    manifest: {
      extra: {
        supabaseUrl: 'test-url',
        supabaseAnonKey: 'test-key',
      },
    },
  },
}));

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.spyOn(console, 'warn').mockImplementation((...args) => {
  if (typeof args[0] === 'string' && args[0].includes('useNativeDriver')) {
    return;
  }
  console.warn(...args);
});
