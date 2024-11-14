import { useFonts } from 'expo-font';
import '@/global.css';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import { createTamagui, TamaguiProvider, YStack } from 'tamagui';
import { Toast, ToastProvider, ToastViewport, useToastState } from '@tamagui/toast';
import defaultConfig from '@tamagui/config/v3';

const config = createTamagui(defaultConfig);
const queryClient = new QueryClient();

type Conf = typeof config
declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf {}
}

SplashScreen.preventAutoHideAsync();


export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
  const CurrentToast = () => {
    const currentToast = useToastState()
  
    if (!currentToast || currentToast.isHandledNatively) return null
    return (
      <Toast
        key={currentToast.id}
        duration={currentToast.duration}
        enterStyle={{ opacity: 0, scale: 0.5, y: -25 }}
        exitStyle={{ opacity: 0, scale: 1, y: -20 }}
        y={0}
        opacity={1}
        scale={1}
        animation="100ms"
        viewportName={currentToast.viewportName}
      >
        <YStack>
          <Toast.Title>{currentToast.title}</Toast.Title>
          {!!currentToast.message && (
            <Toast.Description>{currentToast.message}</Toast.Description>
          )}
        </YStack>
      </Toast>
    )
  }

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={config} defaultTheme='light_blue'>
        <ToastProvider>
          <Slot />
          <CurrentToast/>
          <ToastViewport flexDirection="column-reverse" top={100} right={'25%'} />
        </ToastProvider>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}