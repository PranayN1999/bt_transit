import React from 'react';
import { View, Text, FlatList, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useRoutes } from './../RoutesContext';
import RouteRow from './../components/RouteRow';

const RoutesList: React.FC = () => {
  const router = useRouter();
  const { allRoutes, selectedRoutes, setSelectedRoutes } = useRoutes(); // Custom hook to access route data

  // Function to toggle selection of all routes
  const toggleAllRoutes = () => {
    if (selectedRoutes.length === 0) {
      setSelectedRoutes(allRoutes); // Select all routes if none are selected
    } else {
      setSelectedRoutes([]); // Deselect all routes if any are selected
    }
  };

  return (
    <View style={styles.container}>
      {/* Button to toggle selection of all routes */}
      <TouchableOpacity style={styles.toggleButton} onPress={toggleAllRoutes}>
        <Text style={styles.toggleButtonText}>
          {selectedRoutes.length === 0 ? 'Show All' : 'Hide All'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.title}>Bus Routes</Text>
      {/* FlatList to render the list of routes */}
      {/* https://www.kindacode.com/article/react-native-flatlist-tutorial-and-examples */}
      <FlatList
        data={allRoutes} // Data source for the list
        keyExtractor={(item) => item.route.route_id} // Unique key for each item
        renderItem={({ item }) => (
          <RouteRow
            routeItem={item} // Data for the current route
            selectedRoutes={selectedRoutes} // Array of selected routes
            setSelectedRoutes={setSelectedRoutes} // Function to update selected routes
            onViewSchedule={(route) =>
              router.push({
                pathname: '/bus-schedule',
                params: {
                  route_id: route.route.route_id,
                  route_name: route.route.route_long_name,
                },
              })
            } // Function to navigate to the schedule screen
          />
        )}
      />
      {/* Button to navigate back */}
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
});

export default RoutesList;
