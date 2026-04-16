import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Typography, Layout } from '@/src/theme';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text
        style={[
          styles.tabLabel,
          { color: focused ? Colors.accent.primary : Colors.text.tertiary },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.accent.primary,
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Trang chu',
          tabBarLabel: 'Trang chu',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.bg.card,
    borderTopColor: Colors.border.subtle,
    borderTopWidth: 1,
    height: Layout.bottomNavHeight,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    ...Typography.label,
  },
});
