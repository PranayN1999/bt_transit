import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { RouteItem } from './types';

// Define the props for the RouteRow component
interface RouteRowProps {
  routeItem: RouteItem; // The route data for this row
  selectedRoutes: RouteItem[]; // Array of currently selected routes
  setSelectedRoutes: React.Dispatch<React.SetStateAction<RouteItem[]>>; // Function to update selected routes
  onViewSchedule: (route: RouteItem) => void; // Function to view the schedule of the route
}

const RouteRow: React.FC<RouteRowProps> = ({
  routeItem,
  selectedRoutes,
  setSelectedRoutes,
  onViewSchedule,
}) => {
  // Check if the current route is selected
  const isSelected = selectedRoutes.some(
    (r) => r.route.route_id === routeItem.route.route_id
  );

  // Toggle selection of the route
  const handleRouteSelect = () => {
    setSelectedRoutes((prevSelected) =>
      isSelected
        ? prevSelected.filter((r) => r.route.route_id !== routeItem.route.route_id)
        : [...prevSelected, routeItem]
    );
  };

  return (
    <View style={styles.routeRow}>
      {/* Touchable area for selecting the route */}
      <TouchableOpacity
        style={[styles.routeContainer, isSelected && styles.selectedRoute]}
        onPress={handleRouteSelect}
      >
        <View style={styles.checkboxContainer}>
          {/* Checkbox indicating selection */}
          <View style={[styles.checkbox, isSelected && styles.checkedCheckbox]}>
            {isSelected && <MaterialIcons name="check" size={14} color="#fff" />}
          </View>
          {/* Display route short and long names */}
          <Text style={styles.routeText}>
            {routeItem.route.route_short_name}: {routeItem.route.route_long_name}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Icon to view the schedule of the route */}
      <TouchableOpacity onPress={() => onViewSchedule(routeItem)} style={styles.scheduleIcon}>
        <MaterialIcons name="schedule" size={24} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginRight: 10,
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
    fontSize: 16,
  },
  scheduleIcon: {
    padding: 5,
  },
  selectedRoute: {
    backgroundColor: '#D3E9FF',
  },
});

export default RouteRow;
