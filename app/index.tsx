import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Button, Text } from 'react-native';
import MapView, { Region, Polyline, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useRoutes } from './../RoutesContext';

// Reference: Managing environment variables in React Native with Expo
// Source: https://docs.expo.dev/guides/environment-variables/
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

  const initializeWebSocket = () => {
    const socket = new WebSocket(`${apiUrl}/ws/bus-positions`);

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setBusPositions(data.positions);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
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
            {/* Group shapes by shape_id */}
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
                  .sort((a, b) => a.sequence - b.sequence) // Ensure points are sorted by sequence
                  .map(({ latitude, longitude }) => ({
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                  }))}
                strokeColor={`#${routeItem.route.route_color || 'FF0000'}`}
                strokeWidth={3}
              />
            ))}

            {/* Render stops */}
            {routeItem.stops.map((stop, index) => (
              <Marker
                key={`stop-${routeItem.route.route_id}-${index}`}
                coordinate={{
                  latitude: parseFloat(stop.latitude),
                  longitude: parseFloat(stop.longitude),
                }}
                title={`Stop ${stop.sequence}`}
                description={stop.stop_name || 'Bus Stop'}
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

        {/* Display real-time bus positions */}
        {filteredBusPositions.map((bus, index) => (
          <Marker
            key={`bus-${bus.vehicle_id}-${index}`}
            coordinate={{
              latitude: bus.latitude,
              longitude: bus.longitude,
            }}
            title={`Bus ${bus.vehicle_id}`}
            description={`Route: ${bus.route_short_name}`}
          >
            <View
              style={[
                styles.busMarker,
                {
                  backgroundColor: `#${bus.route_color || '000000'}`,
                },
              ]}
            >
              <Text style={styles.busText}>{bus.route_short_name}</Text>
            </View>
          </Marker>
        ))}
      </MapView>
      <View style={styles.buttonContainer}>
        <Button title="Select Routes" onPress={() => router.push('/routes-list')} />
      </View>
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
  busMarker: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 30,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'white',
  },
  busText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
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
