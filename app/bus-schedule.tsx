import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ScheduleTable from './../components/ScheduleTable';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

interface Stop {
  stop_id: string;
  stop_name: string;
  times: string[];
}

const BusSchedule: React.FC = () => {
  // Retrieve route parameters from the URL
  const { route_id, route_name } = useLocalSearchParams();

  // State variables to manage schedule data, search query, loading status, and errors
  const [schedule, setSchedule] = useState<Stop[]>([]);
  const [filteredSchedule, setFilteredSchedule] = useState<Stop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Api call to get the schedule data for selected bus
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
          setFilteredSchedule(processedData);
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

  // Function to process raw schedule data into a structured format
  const processScheduleData = (scheduleData: any[]): Stop[] => {
    // Initialize an empty object to map stop IDs to Stop objects
    const stopsMap: { [key: string]: Stop } = {};

    // Iterate over each trip in the schedule data
    scheduleData.forEach((trip) => {
      // Iterate over each stop time in the current trip
      trip.stop_times.forEach((st) => {
        // Format the departure time into a readable format
        const time = formatTime(st.departure_time);

        // If the stop is not already in the map, add it
        if (!stopsMap[st.stop_id]) {
          stopsMap[st.stop_id] = {
            stop_id: st.stop_id,
            stop_name: st.stop_name,
            times: [], // Initialize an empty array for times
          };
        }
        // Add the formatted time to the stop's times array
        stopsMap[st.stop_id].times.push(time);
      });
    });

    // Convert the stopsMap object into an array of Stop objects
    const stops = Object.values(stopsMap).map((stop) => {
      // Remove duplicate times and sort them chronologically
      stop.times = Array.from(new Set(stop.times)).sort((a, b) => {
        const dateA = parseTime(a);
        const dateB = parseTime(b);
        return dateA.getTime() - dateB.getTime();
      });
      return stop;
    });

    // Sort the stops alphabetically by stop name
    stops.sort((a, b) => a.stop_name.localeCompare(b.stop_name));

    // Return the processed array of Stop objects
    return stops;
  };

  // Format time from "HH:MM:SS" to "HH:MM AM/PM"
  const formatTime = (timeString: string): string => {
    let [hours, minutes] = timeString.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 24;
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  // Parse time string into a Date object for sorting
  const parseTime = (timeString: string): Date => {
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

  // Handle search input and filter the schedule based on the query
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    // Normalize the query by replacing "&" with "and" and "@" with "at" (case-insensitive) so to handle & and @ in the stop names.
    const normalizedQuery = query.toLowerCase().replace(/&/g, 'and').replace(/@/g, 'at');

    if (!normalizedQuery.trim()) {
      setFilteredSchedule(schedule); // Show all stops if the search bar is empty
    } else {
      const filteredData = schedule.filter((stop) => {
        // Normalize stop names by replacing "&" with "and" and "@" with "at" (case-insensitive) so to handle & and @ in the stop names.
        const normalizedStopName = stop.stop_name.toLowerCase().replace(/&/g, 'and').replace(/@/g, 'at');
        return normalizedStopName.includes(normalizedQuery);
      });

      setFilteredSchedule(filteredData);
    }
  };

  // Display loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Schedule for {route_name}</Text>
        <Text>Loading schedule...</Text>
      </View>
    );
  }

  // Display error message or no schedule available message
  if (error || !schedule.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Schedule for {route_name}</Text>
        <Text>{error || 'No schedule available for this route today.'}</Text>
      </View>
    );
  }

  // Render the schedule and search bar
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
      {/* Schedule Table */}
      <ScheduleTable schedule={filteredSchedule} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
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
});

export default BusSchedule;
