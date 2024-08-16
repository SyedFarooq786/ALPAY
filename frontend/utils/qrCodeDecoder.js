// utils/qrCodeDecoder.js
import { RNCamera } from 'react-native-camera';
import { CameraKitCameraScreen } from 'react-native-camera-kit';

export const decodeQRCodeFromImage = async (base64Image) => {
  return new Promise((resolve, reject) => {
    // Create a temporary CameraKitCameraScreen instance to decode QR code
    const camera = new CameraKitCameraScreen({
      onBarcodeRead: (event) => {
        resolve(event.nativeEvent.codeStringValue);
      },
      onError: (error) => {
        reject(error);
      },
    });
    camera.decodeFromBase64(base64Image);
  });
};
