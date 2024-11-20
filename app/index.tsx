import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Button, Text, Modal, Image, TouchableOpacity } from 'react-native';
import MapView, { Region, Polyline, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useRoutes } from './../RoutesContext';
import BUS_ICON from './../assets/images/bus.png';

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const apiUrl = process.env.EXPO_PUBLIC_WEB_SOCKET_URL;

export default function Home() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const { selectedRoutes } = useRoutes();
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 39.1653,
    longitude: -86.5264,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [busPositions, setBusPositions] = useState([]);
  const router = useRouter();
  const [ws, setWs] = useState<WebSocket | null>(null);

  // State for Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStop, setSelectedStop] = useState(null);
  const [stopPhotoUrl, setStopPhotoUrl] = useState('');

  const initializeWebSocket = () => {
    const socket = new WebSocket(`${apiUrl}/ws/bus-positions`);

    socket.onopen = () => {
      console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setBusPositions(data.positions);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setTimeout(() => initializeWebSocket(), 3000);
    };

    setWs(socket);
  };

  useEffect(() => {
    initializeWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    })();
  }, []);

  const filteredBusPositions = busPositions.filter((bus) =>
    selectedRoutes.some((route) => route.route.route_id === bus.route_id)
  );

  const handleMarkerPress = async (stop) => {
    console.log('Marker clicked:', stop.stop_name);

    try {
      const lat = stop.latitude;
      const lng = stop.longitude;
      const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${lat},${lng}&key=${GOOGLE_API_KEY}`;
      setStopPhotoUrl(streetViewUrl);

      setSelectedStop({
        name: stop.stop_name || 'Bus Stop',
        vicinity: `Lat: ${lat}, Lng: ${lng}`,
      });

      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching Street View image:', error);
      setStopPhotoUrl(null);
      setSelectedStop({
        name: stop.stop_name || 'Bus Stop',
        vicinity: 'No additional information available',
      });
      setModalVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation={true}
        followsUserLocation={true}
        initialRegion={mapRegion}
        region={location ? mapRegion : undefined}
      >
        {selectedRoutes.map((routeItem) => (
          <React.Fragment key={routeItem.route.route_id}>
            {Object.entries(
              routeItem.shape.reduce((acc, point) => {
                const { shape_id } = point;
                if (!acc[shape_id]) acc[shape_id] = [];
                acc[shape_id].push(point);
                return acc;
              }, {})
            ).map(([shapeId, points]) => (
              <Polyline
                key={`shape-${shapeId}`}
                coordinates={points
                  .sort((a, b) => a.sequence - b.sequence)
                  .map(({ latitude, longitude }) => ({
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                  }))}
                strokeColor={`#${routeItem.route.route_color || 'FF0000'}`}
                strokeWidth={3}
              />
            ))}

            {routeItem.stops.map((stop, index) => (
              <Marker
                key={`stop-${routeItem.route.route_id}-${index}`}
                coordinate={{
                  latitude: parseFloat(stop.latitude),
                  longitude: parseFloat(stop.longitude),
                }}
                title={stop.stop_name || `Bus Stop`}
                onPress={() => handleMarkerPress(stop)}
              >
                <View style={styles.stopMarker}>
                  <View
                    style={[
                      styles.innerDot,
                      {
                        backgroundColor: `#${routeItem.route.route_color || '000000'}`,
                      },
                    ]}
                  />
                </View>
              </Marker>
            ))}
          </React.Fragment>
        ))}

        {filteredBusPositions.map((bus, index) => {
          const route = selectedRoutes.find((routeItem) =>
            routeItem.route.route_id === bus.route_id
          );
          const routeColor = route ? `#${route.route.route_color || '000000'}` : 'black';

          return (
            <Marker
              key={`bus-${bus.vehicle_id}-${index}`}
              coordinate={{
                latitude: bus.latitude,
                longitude: bus.longitude,
              }}
              anchor={{ x: 0.5, y: 0.65 }}
              title={`Bus ${bus.vehicle_id}`}
              description={`Route: ${bus.route_short_name}`}
            >
              <View style={styles.busContainer}>
                <View
                  style={[
                    styles.busLabelWithArrow,
                    { borderColor: routeColor },
                  ]}
                >
                  <Text style={[styles.busLabelText]}>
                    {bus.route_short_name}
                  </Text>
                  <View
                    style={[
                      styles.arrowDown,
                      { borderTopColor: routeColor },
                    ]}
                  />
                </View>
                <Image
                  source={BUS_ICON}
                  style={[
                    styles.busIcon,
                    { transform: [{ rotate: `${bus.bearing + 180}deg` }] },
                  ]}
                />
              </View>
            </Marker>
          );
        })}


      </MapView>
      <View style={styles.buttonContainer}>
        <Button title="Select Routes" onPress={() => router.push('/routes-list')} />
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedStop?.name}</Text>
            <Text style={styles.modalSubtitle}>{selectedStop?.vicinity}</Text>
            {stopPhotoUrl ? (
              <Image source={{ uri: stopPhotoUrl }} style={styles.stopImage} />
            ) : (
              <Text>No street view available for this stop.</Text>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '90%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 5,
  },
  busContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  busLabelWithArrow: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    height: 48,
    width: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: 'black',
    marginBottom: -25,
    zIndex: 2,
  },

  busLabelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },

  arrowDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'black',
  },

  busIcon: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },

  stopMarker: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'lightgrey',
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
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

export default Home;
