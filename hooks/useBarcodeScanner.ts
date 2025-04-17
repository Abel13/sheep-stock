// hooks/useBarcodeScanner.ts
import { useState, useEffect, useCallback } from 'react';
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from 'expo-camera';

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
