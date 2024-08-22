import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Modal, Dimensions } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { MultiFormatReader } from '@zxing/library';
import { launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const QRScanner = ({ navigation }) => {
  const [flash, setFlash] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');


  

  const handleBarCodeRead = async ({ data }) => {
    console.log('Scanned QR Code Data:', data);
    

    const { paValue, ctValue, pnValue } = extractPaValue(data);
    if (paValue) {
      navigation.navigate('Sendmoney', { paValue, ctValue, pnValue, phoneNumber });
    } else {
      Alert.alert('Error', 'Failed to extract payment address from QR code');
    }
  };

  const toggleFlash = () => {
    setFlash((prev) => !prev);
  };

  const openGallery = () => {
    launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', `ImagePicker Error: ${response.errorMessage}`);
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const selectedImageUri = response.assets[0].uri;
        console.log('Selected Image URI:', selectedImageUri);
        decodeQRCodeFromImage(selectedImageUri);
      }
    });
  };

  const decodeQRCodeFromImage = async (imageUri) => {
    try {
      const imagePath = imageUri.replace('file://', '');
      const imageData = await RNFS.readFile(imagePath, 'base64');
      const codeReader = new MultiFormatReader();
      const result = await codeReader.decodeFromImage(imageData);
      const { paValue, ctValue, pnValue } = extractPaValue(result.text);
      if (paValue) {
        navigation.navigate('Sendmoney', { paValue, ctValue, pnValue, phoneNumber });
      } else {
        Alert.alert('Error', 'Failed to extract payment address from QR code');
      }
    } catch (error) {
      console.error('Error decoding QR code:', error.message);
      Alert.alert('Error', `Failed to decode QR code: ${error.message}`);
    }
  };

  const extractPaValue = (data) => {
    const paMatch = data.match(/pa=([^&]*)/);
    const ctMatch = data.match(/CT=([^&]*)/);
    const pnMatch = data.match(/pn=([^&]*)/);
    const paValue = paMatch ? decodeURIComponent(paMatch[1]) : null;
    const ctValue = ctMatch ? decodeURIComponent(ctMatch[1]) : null;
    const pnValue = pnMatch ? decodeURIComponent(pnMatch[1]) : null;
    return { paValue, ctValue, pnValue };
  };

  return (
    <View style={{ flex: 1 }}>
      <RNCamera
        style={{ flex: 1 }}
        type={RNCamera.Constants.Type.back}
        flashMode={flash ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off}
        onBarCodeRead={handleBarCodeRead}
      />

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Image source={require('../assets/icons8-back-100.png')} style={styles.backIcon} />
      </TouchableOpacity>

      <View style={styles.topIconsContainer}>
        <TouchableOpacity onPress={toggleFlash}>
          <Image
            source={flash ? require('../assets/icons8-flash-26.png') : require('../assets/icons8-flash-off-50.png')}
            style={styles.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={openGallery}>
          <Image source={require('../assets/icons8-gallery-64.png')} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Help')}>
          <Image source={require('../assets/icons8-help-32.png')} style={styles.icon} />
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
        <Image source={require('/Users/syed/al-pay/frontend/logo.png')} style={styles.logo} />
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
            <TouchableOpacity onPress={() => navigation.navigate('Sendmoney', { data: scannedData, phoneNumber })} style={styles.modalButton}>
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
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: width * 0.8,
    height: width * 0.8,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'absolute',
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
    backgroundColor: 'purple',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default QRScanner;
