import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://your-backend-url'; // Replace with your backend URL

const BusSchedule = () => {
  const { route_id, route_name } = useLocalSearchParams();
  const [schedule, setSchedule] = useState([]);
  const [filteredSchedule, setFilteredSchedule] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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
          const processedData = processScheduleData(data.schedule);
          setSchedule(processedData);
          setFilteredSchedule(processedData); // Initially show all stops
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

    const stops = Object.values(stopsMap).map((stop) => {
      stop.times = Array.from(new Set(stop.times)).sort((a, b) => {
        const dateA = parseTime(a);
        const dateB = parseTime(b);
        return dateA - dateB;
      });
      return stop;
    });

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

  const handleSearch = (query) => {
    setSearchQuery(query);
  
    // Normalize the query by replacing "&" with "and" (case-insensitive)
    const normalizedQuery = query.toLowerCase().replace(/&/g, 'and').replace(/@/g, 'at');
  
    if (!normalizedQuery.trim()) {
      setFilteredSchedule(schedule); // Show all stops if the search bar is empty
    } else {
      const filteredData = schedule.filter((stop) => {
        // Normalize stop names by replacing "&" with "and" (case-insensitive)
        const normalizedStopName = stop.stop_name.toLowerCase().replace(/&/g, 'and').replace(/@/g, 'at');
        return normalizedStopName.includes(normalizedQuery);
      });
  
      setFilteredSchedule(filteredData);
    }
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
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search for a stop..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <ScrollView>
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableRow}>
            <Text style={[styles.cell, styles.headerCell, styles.stopNameCell]}>Stop Name</Text>
            <Text style={[styles.cell, styles.headerCell, styles.timesCell]}>Times</Text>
          </View>

          {/* Data Rows */}
          {filteredSchedule.map((stop, index) => (
            <View
              key={stop.stop_id}
              style={[
                styles.tableRow,
                index % 2 === 0 ? styles.rowAlternate : styles.rowRegular,
              ]}
            >
              <Text style={[styles.cell, styles.stopNameCell]}>{stop.stop_name}</Text>
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
  searchBar: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
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
