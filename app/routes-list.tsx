import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from 'expo-router';

export default function RoutesList() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>This is the Routes List Screen</Text>
      <Button title="Go Back to Home" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
});
