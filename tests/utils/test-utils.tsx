import React from 'react';
import { render as rtlRender } from '@testing-library/react-native';
import config from '@/tamagui.config';
import { TamaguiProvider } from 'tamagui';

function render(ui: React.ReactElement, options = {}) {
  return rtlRender(
    <TamaguiProvider config={config} defaultTheme="light">
      {ui}
    </TamaguiProvider>,
    options,
  );
}

// Re-export everything
export * from '@testing-library/react-native';

// Override render method
export { render };
