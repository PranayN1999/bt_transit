import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { Link } from 'expo-router';

export default function Home() {
  const initialRegion: Region = {
    latitude: 39.1653,
    longitude: -86.5264,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion} />
      <Link href="/routes-list">View Routes</Link>
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
});
