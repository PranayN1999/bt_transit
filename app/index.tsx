import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import MapView, { Region, Polyline, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';

export default function Home() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [routeDetails, setRouteDetails] = useState(null); // Store route details
  const { routeDetails: routeParam } = useLocalSearchParams(); // Fetch the selected route details from params
  const router = useRouter(); // Use router to navigate

  const initialRegion: Region = {
    latitude: 39.1653,
    longitude: -86.5264,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const [mapRegion, setMapRegion] = useState(initialRegion); // Manage the map region

  useEffect(() => {
    // Get the user's current location
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  useEffect(() => {
    const fetchRouteDetails = async (routeId: string) => {
      try {
        // Make an API call to fetch route details
        const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/routes/${routeId}/details`);
        
        if (response.data) {
          const details = response.data;

          // Convert latitude and longitude strings to numbers
          details.shape = details.shape.map(point => ({
            latitude: Number(point.latitude),  // Convert string to number
            longitude: Number(point.longitude), // Convert string to number
          }));

          details.stops = details.stops.map(stop => ({
            latitude: Number(stop.latitude),  // Convert string to number
            longitude: Number(stop.longitude), // Convert string to number
            name: stop.name,
          }));

          setRouteDetails(details);  // Set route details in state

          // Automatically update map region based on the first stop in the selected route
          if (details.stops && details.stops.length > 0) {
            const firstStop = details.stops[0];
            setMapRegion({
              latitude: firstStop.latitude,
              longitude: firstStop.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            });
          }

          console.log("Fetched Route Details:", details);  // Log fetched route details
        } else {
          console.error("No route details found.");
        }
      } catch (error) {
        console.error("Error fetching route details:", error);
      }
    };

    // Check if routeParam (route_id) is available and fetch details
    if (routeParam) {
      const routeId = JSON.parse(routeParam).route_id;
      fetchRouteDetails(routeId);  // Make the API call to get route details
    }
  }, [routeParam]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation={true}
        followsUserLocation={true}
        initialRegion={mapRegion}
        region={
          location && !routeDetails?.stops.length
            ? {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
            : mapRegion
        }
      >
        {/* Draw the route shape as a polyline with route color */}
        {routeDetails?.shape && routeDetails.shape.length > 0 && (
          <Polyline
            coordinates={routeDetails.shape}
            strokeColor={`#${routeDetails.route.route_color}`} // Use route color with '#' prepended
            strokeWidth={3}
          />
        )}

        {/* Place markers for each stop */}
        {routeDetails?.stops && routeDetails.stops.length > 0 &&
          routeDetails.stops.map((stop, index) => (
            <Marker
              key={index}
              coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
              title={stop.name}
            />
          ))}
      </MapView>

      {/* Button to navigate to Routes List */}
      <View style={styles.buttonContainer}>
        <Button
          title="Select Route"
          onPress={() => {
            router.push('/routes-list'); // Navigate to the RoutesList page
          }}
        />
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
});
