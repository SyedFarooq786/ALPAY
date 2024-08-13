import React from 'react';
import {View, Text} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

const QRScanner = ({navigation}) => {
  const onSuccess = e => {
    const scannedData = e.data; 
    navigation.navigate('PaymentScreen', { data: scannedData });
  };

  return (
    <QRCodeScanner
      onRead={onSuccess}
      flashMode={RNCamera.Constants.FlashMode.off}
      topContent={
        <Text>Scan the QR Code</Text>
      }
    />
  );
};

export default QRCodeScanner;
