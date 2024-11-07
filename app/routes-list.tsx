import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useRoutes } from './../RoutesContext';

const RoutesList = () => {
  const router = useRouter();
  const { allRoutes, selectedRoutes, setSelectedRoutes } = useRoutes();

  console.log("All Routes:", allRoutes); // Log to check if routes are available

  const handleRouteSelect = (route) => {
    setSelectedRoutes((prevSelected) =>
      prevSelected.some((r) => r.route.route_id === route.route.route_id)
        ? prevSelected.filter((r) => r.route.route_id !== route.route.route_id)
        : [...prevSelected, route]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bus Routes</Text>
      <FlatList
        data={allRoutes}
        keyExtractor={(item) => item.route.route_id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.routeContainer,
              selectedRoutes.some((r) => r.route.route_id === item.route.route_id) && styles.selectedRoute,
            ]}
            onPress={() => handleRouteSelect(item)}
          >
            <Text>{item.route.route_short_name}: {item.route.route_long_name}</Text>
          </TouchableOpacity>
        )}
      />
      <Button title="View Selected Routes" onPress={() => router.push('/')} />
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
  selectedRoute: {
    backgroundColor: '#D3E9FF',
  },
});

export default RoutesList;
