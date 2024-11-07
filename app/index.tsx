import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import MapView, { Region, Polyline, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useRoutes } from './../RoutesContext';

export default function Home() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const { selectedRoutes } = useRoutes(); // Access selected routes from global state
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 39.1653,
    longitude: -86.5264,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const router = useRouter();

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

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation={true}
        followsUserLocation={true}
        initialRegion={mapRegion}
        region={location ? mapRegion : undefined}
      >
        {/* Draw each selected route's shape and stops */}
        {selectedRoutes.map((routeItem) => (
          <React.Fragment key={routeItem.route.route_id}>
            <Polyline
              coordinates={routeItem.shape.map(({ latitude, longitude }) => ({
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
              }))}
              strokeColor={`#${routeItem.route.route_color || 'FF0000'}`}
              strokeWidth={3}
            />
            {routeItem.stops.map((stop, index) => (
              <Marker
                key={`${routeItem.route.route_id}-${index}`}
                coordinate={{
                  latitude: parseFloat(stop.latitude),
                  longitude: parseFloat(stop.longitude),
                }}
              >
                <View
                  style={[
                    styles.dot,
                    {
                      borderColor: 'white',
                      backgroundColor: `#${routeItem.route.route_color || '000000'}`,
                    },
                  ]}
                />
              </Marker>
            ))}
          </React.Fragment>
        ))}
      </MapView>
      <View style={styles.buttonContainer}>
        <Button title="Select Routes" onPress={() => router.push("/routes-list")} />
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
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
});

export default Home;
