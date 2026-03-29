import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { BleClient } from '@capacitor-community/bluetooth-le';

/**
 * Request camera permission and optionally take a photo
 */
export async function requestCameraPermission() {
  try {
    const permission = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
    return permission;
  } catch (error) {
    console.warn('Camera permission request failed (may be running in browser):', error);
    return null;
  }
}

export async function takePhoto() {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    });
    return image;
  } catch (error) {
    console.warn('Take photo failed:', error);
    return null;
  }
}

export async function pickPhoto() {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
    });
    return image;
  } catch (error) {
    console.warn('Pick photo failed:', error);
    return null;
  }
}

/**
 * Initialize Bluetooth LE and request permissions
 */
export async function requestBluetoothPermission() {
  try {
    await BleClient.initialize({ androidNeverForLocation: true });
    return true;
  } catch (error) {
    console.warn('Bluetooth initialization failed (may be running in browser):', error);
    return false;
  }
}

/**
 * Scan for nearby Bluetooth devices
 */
export async function scanBluetoothDevices(
  onDeviceFound: (device: { deviceId: string; name?: string }) => void,
  duration = 5000
) {
  try {
    await BleClient.requestLEScan({}, (result) => {
      onDeviceFound({
        deviceId: result.device.deviceId,
        name: result.device.name ?? undefined,
      });
    });

    setTimeout(async () => {
      await BleClient.stopLEScan();
    }, duration);
  } catch (error) {
    console.warn('Bluetooth scan failed:', error);
  }
}
