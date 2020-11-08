import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import Map from '../screens/Map';
import Stats from '../screens/Stats';
import { BottomTabParamList, TabOneParamList, TabTwoParamList } from '../types';

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="Map"
      tabBarOptions={{ activeTintColor: Colors[colorScheme].tint }}>
      <BottomTab.Screen
        name="Map"
        component={MapNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="ios-code" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Stats"
        component={StatsNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="ios-code" color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: { name: string; color: string }) {
  return <Ionicons size={30} style={{ marginBottom: -3 }} {...props} />;
}

// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab
const TabMap = createStackNavigator<TabOneParamList>();

function MapNavigator() {
  return (
    <TabMap.Navigator>
      <TabMap.Screen
        name="Map"
        component={Map}
        options={{ headerTitle: 'Map' }}
      />
    </TabMap.Navigator>
  );
}

const TabStats = createStackNavigator<TabTwoParamList>();

function StatsNavigator() {
  return (
    <TabStats.Navigator>
      <TabStats.Screen
        name="Stats"
        component={Stats}
        options={{ headerTitle: 'Stats and administration' }}
      />
    </TabStats.Navigator>
  );
}
