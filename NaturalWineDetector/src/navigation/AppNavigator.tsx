import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/AppTypes';
import {
  CameraScreen,
  AnalysisScreen,
  HistoryScreen,
  WineDetailScreen,
  WineLoggingScreen,
} from '../screens';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Camera"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6B46C1',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{
            title: 'Natural Wine Detector',
            headerLeft: () => null, // Disable back button on main screen
          }}
        />
        <Stack.Screen
          name="Analysis"
          component={AnalysisScreen}
          options={{
            title: 'Wine Analysis',
          }}
        />
        <Stack.Screen
          name="WineLogging"
          component={WineLoggingScreen}
          options={{
            title: 'Log Wine Experience',
          }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{
            title: 'Wine History',
          }}
        />
        <Stack.Screen
          name="WineDetail"
          component={WineDetailScreen}
          options={{
            title: 'Wine Details',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};