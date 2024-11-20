export interface RouteItem {
  route: {
    route_id: string;
    route_short_name: string;
    route_long_name: string;
    [key: string]: any; // Additional route properties
  };
  [key: string]: any; // Additional properties
}
