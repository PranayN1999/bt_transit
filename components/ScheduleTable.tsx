import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

// Interface defining the structure of a "Stop" object
interface Stop {
  stop_id: string; // Unique ID for the stop
  stop_name: string; // Name of the bus stop
  times: string[]; // Array of times the bus arrivals here
}

interface ScheduleTableProps {
  schedule: Stop[]; // Array of Stop objects
}

// Reference: https://www.kindacode.com/article/how-to-implement-tables-in-react-native
// Reference: https://www.scaler.com/topics/react-native-table/
const ScheduleTable: React.FC<ScheduleTableProps> = ({ schedule }) => {
  return (
    <ScrollView>
      <View style={styles.table}>
        {/* Header Row for the table */}
        <View style={styles.tableRow}>
          <Text style={[styles.cell, styles.headerCell, styles.stopNameCell]}>Stop Name</Text>
          <Text style={[styles.cell, styles.headerCell, styles.timesCell]}>Times</Text>
        </View>

        {/* Iterating over the schedule to display each stop and its times */}
        {schedule.map((stop, index) => (
          <View
            key={stop.stop_id} // Key for React's list rendering
            style={[
              styles.tableRow,
              index % 2 === 0 ? styles.rowAlternate : styles.rowRegular, // Alternating row colors
            ]}
          >
            <Text style={[styles.cell, styles.stopNameCell]}>{stop.stop_name}</Text>
            <View style={[styles.cell, styles.timesCell]}>
              <View style={[styles.cell, styles.timesCell]}>
                <Text>
                  {stop.times && stop.times.length > 0 ? stop.times.join(', ') : 'No times available'} {/* Join times into a comma-separated string */}
                </Text>
              </View> 
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
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

export default ScheduleTable;
