import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router'; // Use router for navigation

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

const RoutesList = () => {
  const [routes, setRoutes] = useState([]);
  const router = useRouter(); // Use router for navigation

  const apicall = async () => {
    try {
      const response = await axios.get(apiUrl + '/routes')
      setRoutes([...response.data]);
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  useEffect(() => {
    apicall();
  }, []);

  // Function to handle route selection
  const handleSelectRoute = (route) => {
    // Navigate back to the map screen and pass the route details
    router.push({
      pathname: '/',
      params: { routeDetails: JSON.stringify(route) }, // Pass route details as params
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bus Routes</Text>
      <FlatList
        data={routes}
        keyExtractor={(item) => item.route_id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.routeContainer}
            onPress={() => handleSelectRoute(item)} // Handle route selection
          >
            <Text>{item.route_short_name}: {item.route_long_name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  routeContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default RoutesList;
