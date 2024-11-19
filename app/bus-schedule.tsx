// bus-schedule.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://your-backend-url'; // Replace with your backend URL

const BusSchedule = () => {
  const { route_id, route_name } = useLocalSearchParams();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const response = await fetch(`${apiUrl}/routes/${route_id}/schedule`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        if (data.schedule.length === 0) {
          setError(data.message || 'No schedule available for this route today.');
        } else {
          // Process data to group times by stop
          const processedData = processScheduleData(data.schedule);
          setSchedule(processedData);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading schedule:', error);
        setError('Failed to load schedule.');
        setLoading(false);
      }
    };

    loadSchedule();
  }, [route_id]);

  const processScheduleData = (scheduleData) => {
    const stopsMap = {};

    scheduleData.forEach((trip) => {
      trip.stop_times.forEach((st) => {
        const time = formatTime(st.departure_time);

        if (!stopsMap[st.stop_id]) {
          stopsMap[st.stop_id] = {
            stop_id: st.stop_id,
            stop_name: st.stop_name,
            times: [],
          };
        }
        stopsMap[st.stop_id].times.push(time);
      });
    });

    // Convert stopsMap to array and sort times for each stop
    const stops = Object.values(stopsMap).map((stop) => {
      // Remove duplicate times and sort them
      stop.times = Array.from(new Set(stop.times)).sort((a, b) => {
        const dateA = parseTime(a);
        const dateB = parseTime(b);
        return dateA - dateB;
      });
      return stop;
    });

    // Optionally, sort stops by stop sequence or name
    stops.sort((a, b) => a.stop_name.localeCompare(b.stop_name));

    return stops;
  };

  const formatTime = (timeString) => {
    let [hours, minutes, seconds] = timeString.split(':').map(Number);
    const ampm = (hours % 24) >= 12 ? 'PM' : 'AM';
    hours = hours % 24;
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const parseTime = (timeString) => {
    const [time, ampm] = timeString.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (ampm === 'PM' && hours !== 12) {
      hours += 12;
    }
    if (ampm === 'AM' && hours === 12) {
      hours = 0;
    }
    return new Date(0, 0, 0, hours, minutes);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Schedule for {route_name}</Text>
        <Text>Loading schedule...</Text>
      </View>
    );
  }

  if (error || !schedule.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Schedule for {route_name}</Text>
        <Text>{error || 'No schedule available for this route today.'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schedule for {route_name}</Text>
      <ScrollView>
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableRow}>
            <Text style={[styles.cell, styles.headerCell, styles.stopNameCell]}>Stop Name</Text>
            <Text style={[styles.cell, styles.headerCell, styles.timesCell]}>Times</Text>
          </View>

          {/* Data Rows */}
          {schedule.map((stop, index) => (
            <View
              key={stop.stop_id}
              style={[
                styles.tableRow,
                index % 2 === 0 ? styles.rowAlternate : styles.rowRegular,
              ]}
            >
              {/* Stop Name */}
              <Text style={[styles.cell, styles.stopNameCell]}>{stop.stop_name}</Text>
              {/* Times */}
              <View style={[styles.cell, styles.timesCell]}>
                <Text>{stop.times.join(', ')}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  rowAlternate: {
    backgroundColor: '#f9f9f9',
  },
  rowRegular: {
    backgroundColor: '#ffffff',
  },
  cell: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  headerCell: {
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
  },
  stopNameCell: {
    flex: 2,
  },
  timesCell: {
    flex: 5,
  },
});

export default BusSchedule;
