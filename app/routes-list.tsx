import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useRoutes } from './../RoutesContext';
import { MaterialIcons } from '@expo/vector-icons'; // Importing MaterialIcons from Expo vector icons

const RoutesList = () => {
  const router = useRouter();
  const { allRoutes, selectedRoutes, setSelectedRoutes } = useRoutes();

  // Function to toggle route selection
  const handleRouteSelect = (route) => {
    setSelectedRoutes((prevSelected) =>
      prevSelected.some((r) => r.route.route_id === route.route.route_id)
        ? prevSelected.filter((r) => r.route.route_id !== route.route.route_id)
        : [...prevSelected, route]
    );
  };

  // Toggle all routes
  const toggleAllRoutes = () => {
    if (selectedRoutes.length === 0) {
      setSelectedRoutes(allRoutes);
    } else {
      setSelectedRoutes([]);
    }
  };

  // Function to navigate to the Bus Schedule screen
  const handleViewSchedule = (route) => {
    router.push({
      pathname: '/bus-schedule',
      params: { route_id: route.route.route_id, route_name: route.route.route_long_name },
    });
  };

  return (
    <View style={styles.container}>
      {/* Show All / Hide All Button */}
      <TouchableOpacity style={styles.toggleButton} onPress={toggleAllRoutes}>
        <Text style={styles.toggleButtonText}>
          {selectedRoutes.length === 0 ? 'Show All' : 'Hide All'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.title}>Bus Routes</Text>
      <FlatList
        data={allRoutes}
        keyExtractor={(item) => item.route.route_id}
        renderItem={({ item }) => {
          const isSelected = selectedRoutes.some((r) => r.route.route_id === item.route.route_id);
          return (
            <View style={styles.routeRow}>
              {/* Checkbox and Route Name */}
              <TouchableOpacity
                style={[styles.routeContainer, isSelected && styles.selectedRoute]}
                onPress={() => handleRouteSelect(item)}
              >
                <View style={styles.checkboxContainer}>
                  <View style={[styles.checkbox, isSelected && styles.checkedCheckbox]}>
                    {isSelected && (
                      <MaterialIcons name="check" size={14} color="#fff" /> // Using MaterialIcons for the check icon
                    )}
                  </View>
                  <Text style={styles.routeText}>
                    {item.route.route_short_name}: {item.route.route_long_name}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Schedule Icon */}
              <TouchableOpacity onPress={() => handleViewSchedule(item)} style={styles.scheduleIcon}>
                <MaterialIcons name="schedule" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
          );
        }}
      />
      <Button title="View Selected Routes" onPress={() => router.back()} />
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
  toggleButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  routeContainer: {
    flex: 1,
    marginRight: 10, // Add spacing between text and icon
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCheckbox: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  routeText: {
    fontSize: 16, // Adjust text size for better readability
  },
  scheduleIcon: {
    padding: 5, // Add some padding around the icon for better clickability
  },
  selectedRoute: {
    backgroundColor: '#D3E9FF',
  },
});

export default RoutesList;
