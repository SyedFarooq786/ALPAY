import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Modal } from 'react-native';
import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
import { runOnJS } from 'react-native-reanimated';
import * as ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';
import { BrowserMultiFormatReader } from '@zxing/library'; // Import ZXing library
import jsQR from 'jsqr';
import { decode as atob } from 'base-64'; 

const QRScanner = ({ navigation }) => {
  const devices = useCameraDevices();
  const device = devices.back;

  const [flash, setFlash] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Define the frame processor using ZXing library
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';

    try {
      const reader = new BrowserMultiFormatReader();
      const result = reader.decode(frame);
      if (result && result.getText()) {
        console.log('Decoded QR Code Text:', result.getText());
        runOnJS(handleScannedData)(result.getText());
      }
    } catch (error) {
      console.log('Error decoding QR code:', error);
    }
  }, []);

  const handleScannedData = (data) => {
    console.log('Scanned QR Code Data:', data);
    setScannedData(data);
    setModalVisible(true);
  };

  const toggleFlash = () => {
    console.log('Toggling Flash:', !flash); 
    setFlash((prev) => !prev);
  };

  const openGallery = () => {
    ImagePicker.launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        return;
      }

      if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', `ImagePicker Error: ${response.errorMessage}`);
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const selectedImageUri = response.assets[0].uri;
        console.log('Selected Image URI:', selectedImageUri);

        try {
          const fileData = await RNFetchBlob.fs.readFile(selectedImageUri, 'base64');
          console.log('Base64 Data from Image:', fileData);
          // Decode base64 to get QR code result directly
          const decodedData = await decodeQRCodeFromBase64(fileData);
          console.log('Decoded QR Code Data from Image:', decodedData);
          setScannedData(decodedData);
          setModalVisible(true);
        } catch (error) {
          console.log('Decode Error:', error);
          Alert.alert('Error', 'Failed to decode QR code from the selected image.');
        }
      }
    });
  };

  const decodeQRCodeFromBase64 = async (base64Data) => {
    // Implement QR code decoding logic if needed, for now, return base64 data directly
    console.log('Base64 Data for Decoding:', base64Data);
    return base64Data; // Placeholder, replace with actual decoding logic
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

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Image source={require('/Users/syed/al-pay/frontend/icons8-back-100.png')} style={styles.backIcon} />
      </TouchableOpacity>

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

      <View style={styles.scanAreaContainer}>
        <View style={styles.scanArea}>
          <View style={styles.scanAreaCornerTL} />
          <View style={styles.scanAreaCornerTR} />
          <View style={styles.scanAreaCornerBL} />
          <View style={styles.scanAreaCornerBR} />
        </View>
      </View>

      <View style={styles.footerContainer}>
        <Image source={require('/Users/syed/al-pay/frontend/world-pay-high-resolution-logo.png')} style={styles.logo} />
        <Text style={styles.footerText}>BHIM  |  UPI</Text>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Scanned Data: {scannedData}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Sendmoney', { data: scannedData })} style={styles.modalButton}>
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
