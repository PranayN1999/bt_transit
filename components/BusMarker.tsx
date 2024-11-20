import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps'; // Used to display a marker on the map
import BUS_ICON from './../assets/images/bus.png'; // Custom bus icon for the marker

interface BusMarkerProps {
  bus: {
    vehicle_id: string; // Unique ID for the bus
    latitude: number; // Latitude of the bus's current location
    longitude: number; // Longitude of the bus's current location
    bearing: number; // The direction the bus is heading (in degrees)
    route_short_name: string; // Short name or number of the bus route
    route_color?: string; // Optional color associated with the route
  };
}

const BusMarker: React.FC<BusMarkerProps> = ({ bus }) => {
  const routeColor = bus.route_color ? `#${bus.route_color}` : 'black'; // Default to black if route color is not provided

  return (
    <Marker
      coordinate={{
        latitude: bus.latitude, // Setting the latitude of the marker
        longitude: bus.longitude, // Setting the longitude of the marker
      }}
      anchor={{ x: 0.5, y: 0.65 }} // Position the marker image correctly
      title={`Bus ${bus.vehicle_id}`} // Tooltip title showing bus ID
      description={`Route: ${bus.route_short_name}`} // Tooltip description showing route name
    >
      <View style={styles.busContainer}>
        {/* Label displaying the route short name and an arrow pointing down */}
        <View style={[styles.busLabelWithArrow, { borderColor: routeColor }]}>
          <Text style={styles.busLabelText}>{bus.route_short_name}</Text>
          <View style={[styles.arrowDown, { borderTopColor: routeColor }]} />
        </View>
        {/* Bus icon, rotated to match the bus's bearing/direction */}
        <Image
          source={BUS_ICON}
          style={[
            styles.busIcon,
            { transform: [{ rotate: `${bus.bearing + 180}deg` }] }, // Rotating the bus based on bearing
          ]}
        />
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  busContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  busLabelWithArrow: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 6,
    paddingVertical: 4,
    height: 46,
    width: 46,
    borderRadius: 23,
    borderWidth: 4,
    marginBottom: -25,
  },
  busLabelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'black',
  },
  arrowDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  busIcon: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
});

export default BusMarker;
