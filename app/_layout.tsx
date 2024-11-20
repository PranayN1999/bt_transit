import { Stack } from 'expo-router';
import { RoutesProvider } from '@/RoutesContext';

// Reference: https://docs.expo.dev/router/advanced/stack/
export default function RootLayout() {
  return (
    <RoutesProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ title: 'BT Transit' }}
        />
        <Stack.Screen
          name="routes-list"
          options={{ title: 'Select Routes' }}
        />
        <Stack.Screen
          name="bus-schedule"
          options={{ title: 'Bus Schedules' }}
        />
      </Stack>
    </RoutesProvider>
  );
}
