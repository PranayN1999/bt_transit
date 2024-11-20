// components/BusMarker.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import BUS_ICON from './../assets/images/bus.png';

interface BusMarkerProps {
  bus: {
    vehicle_id: string;
    latitude: number;
    longitude: number;
    bearing: number;
    route_short_name: string;
    route_color?: string;
  };
}

const BusMarker: React.FC<BusMarkerProps> = ({ bus }) => {
  const routeColor = bus.route_color ? `#${bus.route_color}` : 'black';

  return (
    <Marker
      coordinate={{
        latitude: bus.latitude,
        longitude: bus.longitude,
      }}
      anchor={{ x: 0.5, y: 0.65 }}
      title={`Bus ${bus.vehicle_id}`}
      description={`Route: ${bus.route_short_name}`}
    >
      <View style={styles.busContainer}>
        <View style={[styles.busLabelWithArrow, { borderColor: routeColor }]}>
          <Text style={styles.busLabelText}>{bus.route_short_name}</Text>
          <View style={[styles.arrowDown, { borderTopColor: routeColor }]} />
        </View>
        <Image
          source={BUS_ICON}
          style={[
            styles.busIcon,
            { transform: [{ rotate: `${bus.bearing + 180}deg` }] },
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
