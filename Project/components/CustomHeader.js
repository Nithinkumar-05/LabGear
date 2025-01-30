import React from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, Image } from 'react-native';
import { Appbar } from 'react-native-paper';

const CustomHeader = () => {
  // Get the current date
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long', // Full weekday name (e.g., "Monday")
    year: 'numeric', // Full year (e.g., "2023")
    month: 'long',   // Full month name (e.g., "January")
    day: 'numeric',  // Day of the month (e.g., "30")
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Customize the status bar */}
      <StatusBar
        backgroundColor="#3b82f6" // Match the header background color
        barStyle="light-content"  // Light text (white) for the status bar
      />

      {/* Header container */}
      <View style={styles.headerContainer}>
        

        {/* Header with Appbar */}
        <Appbar.Header style={styles.appbarHeader}>
          <Appbar.Content
            title={
              <Text style={styles.titleText}>LabGear</Text>
            }
          />
          {/* Add additional Appbar.Action components here for icons or buttons */}
          <Appbar.Action icon="bell"  onPress={() => {}} />
        </Appbar.Header>
      </View>
    </SafeAreaView>
  );
};

// Define styles using StyleSheet
const styles = StyleSheet.create({
  
  headerContainer: {
    backgroundColor: '#3b82f6', // Blue background
  },
  appbarHeader: {
    backgroundColor:'#3b82f6' , // Transparent background for Appbar
    
  },
  titleText: {
    color: 'white', // White text color
    fontSize: 20, // Text size
    fontWeight: 'bold', // Bold text
  },
  dateText: {
    color: 'white', // White text color
    fontSize: 16, // Slightly smaller text size
    textAlign: 'center', // Center the date text
    paddingTop: 10, // Add some padding at the top
    paddingBottom: 5, // Add some padding at the bottom
  },
});

export default CustomHeader;