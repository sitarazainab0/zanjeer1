import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.fcc907c1cf1241d59ec0484f83eec93b',
  appName: 'ZANJEER',
  webDir: 'dist',
  server: {
    url: 'https://fcc907c1-cf12-41d5-9ec0-484f83eec93b.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    Camera: {
      // iOS permission descriptions
      permissions: {
        camera: 'ZANJEER needs camera access to take photos and scan QR codes for mesh networking.',
        photos: 'ZANJEER needs photo library access to share images in chats.',
      },
    },
    BluetoothLe: {
      // iOS permission descriptions
      displayStrings: {
        bluetoothPermission: 'ZANJEER needs Bluetooth access for mesh networking and device discovery.',
        bluetoothAlwaysUsage: 'ZANJEER uses Bluetooth to maintain mesh network connections in the background.',
      },
    },
  },
  ios: {
    // These will be added to Info.plist when running `npx cap sync`
    appendToInfoPlist: {
      NSCameraUsageDescription: 'ZANJEER needs camera access to take photos and scan QR codes for mesh networking.',
      NSPhotoLibraryUsageDescription: 'ZANJEER needs photo library access to share images in chats.',
      NSPhotoLibraryAddUsageDescription: 'ZANJEER needs permission to save photos to your library.',
      NSBluetoothAlwaysUsageDescription: 'ZANJEER uses Bluetooth to maintain mesh network connections.',
      NSBluetoothPeripheralUsageDescription: 'ZANJEER uses Bluetooth for mesh networking and device discovery.',
    },
  },
};

export default config;
