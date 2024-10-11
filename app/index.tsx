import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Link } from 'expo-router';

export default function Home() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const initialRegion: Region = {
    latitude: 39.1653,
    longitude: -86.5264,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        region={
          location
            ? {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
            : initialRegion
        }
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="You are here"
          />
        )}
      </MapView>
      <Link href="/routes-list" style={styles.link}>
        View Routes
      </Link>
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
  link: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
  },
});
