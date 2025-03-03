import React from 'react';
import { View, Text, Dimensions,ScrollView } from 'react-native';
import { CartesianChart, Bar } from "victory-native";

const CustomChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <View style={{ height: 300, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#666' }}>No expense data available</Text>
      </View>
    );
  }

  const formattedData = data.map(item => ({
    x: item.x,
    y: item.y,
    color: item.color
  }));
  
  return (
    <View style={{ height: 300, backgroundColor: 'white', margin: 8, padding: 8, borderRadius: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
        Equipment Expenses
      </Text>
      <View className='flex-1 items-center justify-center' >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} >
      <CartesianChart
        width={Dimensions.get('window').width - 32}
        height={200}  
        data={formattedData}
        xKey="x"
        yKeys={["y"]}
        axisOptions={{
          independent: {
            tickCount: Math.min(formattedData.length, 6),
            tickLabelStyle: {
              angle: -45,
              fontSize: 10,
              padding: 5
            },
            tickLabelFormatter: (value) => 
              value.length > 10 ? value.substring(0, 10) + '...' : value
          },
          dependent: {
            tickLabelFormatter: (value) => `₹${Math.round(value/1000)}K`,
            tickCount: 5,
          }
        }}
        domainPadding={{ x: 20, y: 10 }}
      >
        {({ points, chartBounds }) => (
          <Bar
            points={points.y}
            chartBounds={chartBounds}
            color={points.color}
            roundedCorners={{ topLeft: 5, topRight: 5 }}
            animate={{ type: "spring", duration: 500 }}
          />
        )}
      </CartesianChart>

      {/* Simple legend */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, justifyContent: 'center' }}>
        {formattedData.map((item, index) => (
          <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12, marginBottom: 4 }}>
            <Text style={{ fontSize: 10 }}>
              {item.x.length > 8 ? item.x.substring(0, 8) + '...' : item.x}
            </Text>
          </View>
        ))}
      </View>
      </ScrollView>
      </View>
    </View>
  );
};

export default CustomChart;