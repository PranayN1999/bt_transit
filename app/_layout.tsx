import { Stack } from 'expo-router';
import { RoutesProvider } from '@/RoutesContext';

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
