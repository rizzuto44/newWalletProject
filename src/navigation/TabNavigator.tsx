import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

import WalletScreen from '../screens/WalletScreen';
import EarnScreen from '../screens/EarnScreen';
import SecurityScreen from '../screens/SecurityScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Feather>['name'];

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Earn') {
            iconName = 'bar-chart-2';
          } else if (route.name === 'Security') {
            iconName = 'shield';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          } else {
            iconName = 'circle';
          }

          return <Feather name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: '#eee'
        },
        tabBarLabelStyle: {
            fontWeight: '600'
        }
      })}
    >
      <Tab.Screen name="Home" component={WalletScreen} />
      <Tab.Screen 
        name="Earn" 
        component={EarnScreen} 
        listeners={{
            tabPress: e => e.preventDefault(),
        }}
      />
      <Tab.Screen 
        name="Security" 
        component={SecurityScreen} 
        listeners={{
            tabPress: e => e.preventDefault(),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        listeners={{
            tabPress: e => e.preventDefault(),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator; 