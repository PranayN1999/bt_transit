import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';

interface StopInfoModalProps {
  modalVisible: boolean; // Whether the modal is visible
  stopPhotoUrl: string | null; // URL for the stop's photo (optional)
  selectedStop: {
    name: string; // Name of the selected bus stop
    vicinity: string; // Additional details about the stop's location
  } | null; // The selected stop object or null if no stop is selected
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>; // Function to toggle the modal's visibility
}

const StopInfoModal: React.FC<StopInfoModalProps> = ({
  modalVisible,
  stopPhotoUrl,
  selectedStop,
  setModalVisible,
}) => {
  return (
    <Modal
      animationType="fade" // Fade animation for modal appearance/disappearance
      transparent={true} // Allows background to show with transparency
      visible={modalVisible} // Controls whether the modal is visible
      onRequestClose={() => setModalVisible(false)} // Closes modal when the user requests it
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Display the name of the selected stop, or a default text */}
          <Text style={styles.modalTitle}>{selectedStop?.name || 'Bus Stop'}</Text>
          {/* Display the vicinity information or a fallback message */}
          <Text style={styles.modalSubtitle}>{selectedStop?.vicinity || 'No details available'}</Text>
          {/* Conditionally display the photo of the stop, if available */}
          {stopPhotoUrl ? (
            <Image source={{ uri: stopPhotoUrl }} style={styles.stopImage} />
          ) : (
            <Text>No street view available for this stop.</Text>
          )}
          {/* Close button to dismiss the modal */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 15,
    textAlign: 'center',
  },
  stopImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default StopInfoModal;
