// hooks/useBarcodeScanner.ts
import { useEffect } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';

export function useBarcodeScanner() {
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission || !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  return {
    hasPermission: permission?.granted ?? false,
    CameraViewComponent: CameraView,
  };
}
