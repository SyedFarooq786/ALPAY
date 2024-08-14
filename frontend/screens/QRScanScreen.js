import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Modal } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import * as ImagePicker from 'react-native-image-picker';
import { BrowserMultiFormatReader } from '@zxing/library'; // Import ZXing library

const QRScanner = ({ navigation }) => {
  const devices = useCameraDevices();
  const device = devices.back;

  const [flash, setFlash] = useState(false);
  const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE]);
  const [scannedData, setScannedData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (barcodes.length > 0) {
      const data = barcodes[0].displayValue;
      setScannedData(data);
      setModalVisible(true);
    }
  }, [barcodes]);

  const handleScannedData = () => {
    if (scannedData.includes('upi')) {
      setModalVisible(false);
      navigation.navigate('Sendmoney', { data: scannedData });
    } else {
      Alert.alert('Invalid QR Code', 'This QR code does not contain UPI information.');
    }
  };

  const toggleFlash = () => {
    setFlash((prev) => !prev);
  };

  const openGallery = () => {
    ImagePicker.launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const selectedImageUri = response.assets[0].uri;

        // Decode QR code from image
        try {
          const response = await fetch(selectedImageUri);
          const blob = await response.blob();
          const reader = new FileReader();

          reader.onload = async () => {
            const binaryString = reader.result;
            const codeReader = new BrowserMultiFormatReader();
            try {
              const result = await codeReader.decodeFromBinary(binaryString);
              setScannedData(result.text);
              setModalVisible(true);
            } catch (error) {
              Alert.alert('Error', 'Failed to decode QR code from the selected image.');
            }
          };
          reader.readAsArrayBuffer(blob);
        } catch (error) {
          Alert.alert('Error', 'Failed to load image.');
        }
      }
    });
  };

  return (
    <View style={{ flex: 1 }}>
      {device != null && (
        <Camera
          style={{ flex: 1 }}
          device={device}
          isActive={true}
          flash={flash ? 'on' : 'off'}
          frameProcessor={frameProcessor}
          frameProcessorFps={5}
        />
      )}

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Image source={require('/Users/syed/al-pay/frontend/icons8-back-100.png')} style={styles.backIcon} />
      </TouchableOpacity>

      {/* Top icons */}
      <View style={styles.topIconsContainer}>
        <TouchableOpacity onPress={toggleFlash}>
          <Image
            source={flash ? require('/Users/syed/al-pay/frontend/icons8-flash-26.png') : require('/Users/syed/al-pay/frontend/icons8-flash-off-50.png')}
            style={styles.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={openGallery}>
          <Image source={require('/Users/syed/al-pay/frontend/icons8-gallery-64.png')} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Help')}>
          <Image source={require('/Users/syed/al-pay/frontend/icons8-help-32.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>

      {/* QR code scanning area */}
      <View style={styles.scanAreaContainer}>
        <View style={styles.scanArea}>
          <View style={styles.scanAreaCornerTL} />
          <View style={styles.scanAreaCornerTR} />
          <View style={styles.scanAreaCornerBL} />
          <View style={styles.scanAreaCornerBR} />
        </View>
      </View>

      {/* Footer with logo and text */}
      <View style={styles.footerContainer}>
        <Image source={require('/Users/syed/al-pay/frontend/world-pay-high-resolution-logo.png')} style={styles.logo} />
        <Text style={styles.footerText}>BHIM  |  UPI</Text>
      </View>

      {/* Modal for scanned data */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Scanned Data: {scannedData}</Text>
            <TouchableOpacity onPress={handleScannedData} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Proceed to Send Money</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
  },
  backIcon: {
    width: 32,
    height: 32,
  },
  topIconsContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  icon: {
    width: 24,
    height: 24,
    marginHorizontal: 15,
  },
  scanAreaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanAreaCornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderColor: 'purple',
  },
  scanAreaCornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderColor: 'purple',
  },
  scanAreaCornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: 'purple',
  },
  scanAreaCornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: 'purple',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  footerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default QRScanner;
