// Location service - placeholder for future implementation
import { LocationData } from '../types';

export class LocationService {
  static async getCurrentLocation(): Promise<LocationData> {
    // Placeholder implementation
    throw new Error('Not implemented yet');
  }

  static async requestLocationPermission(): Promise<boolean> {
    // Placeholder implementation
    return false;
  }
}