import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import MapView, { Region, Polyline, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useRoutes } from './../RoutesContext';
import StopInfoModal from './../components/StopInfoModal';
import BusMarker from './../components/BusMarker';

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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStop, setSelectedStop] = useState(null);
  const [stopPhotoUrl, setStopPhotoUrl] = useState('');
  const router = useRouter();

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

        {filteredBusPositions.map((bus, index) => (
          <BusMarker key={`bus-${bus.vehicle_id}-${index}`} bus={bus} />
        ))}
      </MapView>
      <View style={styles.buttonContainer}>
        <Button title="Select Routes" onPress={() => router.push('/routes-list')} />
      </View>

      <StopInfoModal
        modalVisible={modalVisible}
        stopPhotoUrl={stopPhotoUrl}
        selectedStop={selectedStop}
        setModalVisible={setModalVisible}
      />
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
});

export default Home;
