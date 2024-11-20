import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import MapView, { Region, Polyline, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useRoutes } from './../RoutesContext';
import StopInfoModal from './../components/StopInfoModal'; // Modal for displaying bus stop details
import BusMarker from './../components/BusMarker'; // Component for displaying bus markers

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const apiUrl = process.env.EXPO_PUBLIC_WEB_SOCKET_URL;

export default function Home() {
  // State for user's current location
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  // State for the map region
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 39.1653, // Default latitude
    longitude: -86.5264, // Default longitude
    latitudeDelta: 0.05, // Default zoom level for latitude
    longitudeDelta: 0.05, // Default zoom level for longitude
  });

  const { selectedRoutes } = useRoutes(); // Context for selected routes
  const [busPositions, setBusPositions] = useState([]); // State to hold real-time bus positions
  const [modalVisible, setModalVisible] = useState(false); // State to control modal visibility
  const [selectedStop, setSelectedStop] = useState(null); // State for selected bus stop details
  const [stopPhotoUrl, setStopPhotoUrl] = useState(''); // URL for the Google Maps street view image
  const router = useRouter(); // Router for navigation

  // Function to initialize the WebSocket connection
  const initializeWebSocket = () => {
    const socket = new WebSocket(`${apiUrl}/ws/bus-positions`);

    socket.onopen = () => {
      console.log('WebSocket connected'); // Log when WebSocket connects
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data); // Parse incoming data
      setBusPositions(data.positions); // Update bus positions state
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error); // Handle WebSocket errors
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected'); // Log when WebSocket disconnects
      setTimeout(() => initializeWebSocket(), 3000); // Retry connection after 3 seconds
    };
  };

  // Initialize WebSocket when the component mounts
  useEffect(() => {
    initializeWebSocket();

    return () => {
      if (ws) {
        ws.close(); // Close WebSocket when the component unmounts
      }
    };
  }, []);

  // Request user's location permissions and fetch current location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync(); // Request permissions
      if (status !== 'granted') return; // Exit if permission is denied

      const location = await Location.getCurrentPositionAsync({}); // Fetch current location
      setLocation(location); // Update location state
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }); // Update map region to focus on user's location
    })();
  }, []);

  // Filter bus positions based on selected routes
  const filteredBusPositions = busPositions.filter((bus) =>
    selectedRoutes.some((route) => route.route.route_id === bus.route_id)
  );

  // Function to handle marker press for bus stops
  const handleMarkerPress = async (stop) => {
    try {
      const lat = stop.latitude; // Stop latitude
      const lng = stop.longitude; // Stop longitude
      const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${lat},${lng}&key=${GOOGLE_API_KEY}`; // URL for Google Street View
      setStopPhotoUrl(streetViewUrl); // Set street view URL

      // Set selected stop details
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
      {/* Map displaying user location, routes, and bus positions */}
      <MapView
        style={styles.map}
        showsUserLocation={true} // Show user location
        followsUserLocation={true} // Follow user's location
        initialRegion={mapRegion} // Set initial region
        region={location ? mapRegion : undefined} // Update region dynamically
      >
        {/* Display routes and stops */}
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
                strokeColor={`#${routeItem.route.route_color || 'FF0000'}`} // Use route color or red as default
                strokeWidth={3} // Line thickness
              />
            ))}

            {/* Markers for stops */}
            {routeItem.stops.map((stop, index) => (
              <Marker
                key={`stop-${routeItem.route.route_id}-${index}`}
                coordinate={{
                  latitude: parseFloat(stop.latitude),
                  longitude: parseFloat(stop.longitude),
                }}
                title={stop.stop_name || `Bus Stop`} // Default title if stop name is unavailable
                onPress={() => handleMarkerPress(stop)}
              >
                <View style={styles.stopMarker}>
                  <View
                    style={[
                      styles.innerDot,
                      {
                        backgroundColor: `#${routeItem.route.route_color || '000000'}`, // Use route color or black as default
                      },
                    ]}
                  />
                </View>
              </Marker>
            ))}
          </React.Fragment>
        ))}

        {/* Display bus markers */}
        {filteredBusPositions.map((bus, index) => (
          <BusMarker key={`bus-${bus.vehicle_id}-${index}`} bus={bus} />
        ))}
      </MapView>

      {/* Button to navigate to route selection */}
      <View style={styles.buttonContainer}>
        <Button title="Select Routes" onPress={() => router.push('/routes-list')} />
      </View>

      {/* Modal to display stop information */}
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
