# BT Transit

This project is a **React Native** application designed for tracking bloomington transit buses in real-time, displaying routes, stops, and current bus positions on a map. The app also integrates a user-friendly interface for route selection and provides detailed information about bus stops, including Google Street View images.

---

## Features

### Real-Time Bus Tracking
- Displays live bus positions using **WebSocket**.
- Filters buses based on selected routes.

### Interactive Map
- Uses **react-native-maps** to display:
  - Bus routes as polylines.
  - Bus stops as markers.
  - Real-time bus locations with directional markers.

### Stop Information Modal
- Displays details about bus stops when clicked:
  - Name and coordinates of the stop.
  - Google Street View image (if available).

### Route Selection
- Provides a route selection screen where users can choose which routes to display.

### User Location Tracking
- Requests and displays the user's current location on the map.
- Automatically centers the map to the user's location.

---

## Project Structure

### `index.tsx`
- Main entry point for the home screen.
- Handles:
  - Map rendering.
  - WebSocket connection for live bus data.
  - User location tracking.
  - Integration of all components like `BusMarker` and `StopInfoModal`.

### Components
#### `components/BusMarker.tsx`
- Renders individual bus markers on the map.
- Displays directional indicators and bus route numbers.

#### `components/StopInfoModal.tsx`
- Modal to display details about a clicked bus stop.
- Fetches and displays a Google Street View image if available.

#### `RoutesContext.tsx`
- Provides context for managing selected routes and sharing data across the app.

---

## Installation

### Prerequisites
- **Node.js** installed on your system.
- A valid **Google Maps API Key** for accessing Google Maps and Street View.

### Steps
1. Clone the repository:
   ```bash
   git clone [https://github.com/your-repo/bus-route-tracking.git](https://github.com/PranayN1999/bt_transit.git)
   cd bt_transit
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root and add the following:
   ```env
   EXPO_PUBLIC_API_URL=backend-https-url
   EXPO_PUBLIC_WEB_SOCKET_URL=backend-web-socket-url
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=google-maps-api-key
   ```
4. Run the application:
   ```bash
   npm start
   ```

---

## Usage

### Home Screen
- The main screen displays a map with:
  - Your current location.
  - Routes as polylines.
  - Bus stops as markers.

### Route Selection
- Navigate to the route selection screen to toggle which routes are displayed.

### Viewing Stop Information
1. Click on a bus stop marker.
2. View details in a modal, including:
   - Stop name.
   - Coordinates.
   - Google Street View image (if available).

### Real-Time Bus Tracking
- Watch buses update in real-time as they move along their routes.

---

## Technology Stack

- **React Native**: For cross-platform mobile app development.
- **Expo**: For rapid development and testing.
- **React Native Maps**: For map rendering and geolocation.
- **WebSocket**: For real-time bus position updates.
- **Google Maps API**: For route polylines and Street View images.
- **Context API**: For managing global state, such as selected routes.

---

## Folder Structure
```
src/
├── assets/                 # Static assets like images
│   └── images/
│       └── bus.png
├── components/             # Reusable components
│   ├── BusMarker.tsx       # Component for rendering bus markers
│   ├── StopInfoModal.tsx   # Component for rendering bus stop details in a modal
├── RoutesContext.tsx       # Context for managing selected routes
├── index.tsx               # Main entry point for the app
```

---

## Future Enhancements

1. **Offline Support**:
   - Cache route and stop data locally for offline usage.
2. **Enhanced Filtering**:
   - Add additional filters for routes and buses (e.g., based on time or distance).
3. **Push Notifications**:
   - Notify users about bus arrival times or delays.

Icon used for bus - <a href="https://www.flaticon.com/free-icons/yellow" title="yellow icons">Yellow icons created by Ylivdesign - Flaticon</a>

![search bus stop in bus schedule](https://github.com/user-attachments/assets/646a80d6-38ad-4e5e-88d4-6c8639e81581)
![select-routes](https://github.com/user-attachments/assets/9ff96e0d-95a8-45e9-b059-07f97d829193)
![bus live location](https://github.com/user-attachments/assets/4ec7c394-c02c-4b24-8e83-d865d9b2f8e4)
![bus stop image](https://github.com/user-attachments/assets/e3ed937c-5309-4912-9ee3-a95c7a19aa1c)
