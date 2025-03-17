import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { MaterialIcons } from '@expo/vector-icons';

// Sample data - replace this with your actual data fetching logic
const sampleLabs = [
  {
    labId: "LAB0001",
    labName: "308 Lab",
    department: "CSE",
    location: "308 CM block",
    totalAmountSpent: 13000,
    totalApproved: 15000,
    equipmentExpenses: [
      { name: "Printer", amountSpent: 12500, approvedQuantity: 1 },
      { name: "Mouse", amountSpent: 500, approvedQuantity: 1 }
    ]
  },
  {
    labId: "LAB0002",
    labName: "Physics Lab",
    department: "PHY",
    location: "201 Science block",
    totalAmountSpent: 25000,
    totalApproved: 30000,
    equipmentExpenses: [
      { name: "Oscilloscope", amountSpent: 20000, approvedQuantity: 2 },
      { name: "Digital Multimeter", amountSpent: 5000, approvedQuantity: 5 }
    ]
  },
  {
    labId: "LAB0003",
    labName: "Chemistry Lab",
    department: "CHEM",
    location: "105 Science block",
    totalAmountSpent: 18000,
    totalApproved: 20000,
    equipmentExpenses: [
      { name: "Microscope", amountSpent: 15000, approvedQuantity: 3 },
      { name: "Test Tubes", amountSpent: 3000, approvedQuantity: 50 }
    ]
  },
  {
    labId: "LAB0004",
    labName: "Electronics Lab",
    department: "ECE",
    location: "405 Engineering block",
    totalAmountSpent: 30000,
    totalApproved: 35000,
    equipmentExpenses: [
      { name: "Function Generator", amountSpent: 18000, approvedQuantity: 2 },
      { name: "Circuit Board", amountSpent: 12000, approvedQuantity: 20 }
    ]
  }
];

const Analytics = () => {
  const [selectedLab, setSelectedLab] = useState(null);
  const [labs, setLabs] = useState(sampleLabs);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    // Initialize with the first lab selected
    if (labs.length > 0 && !selectedLab) {
      setSelectedLab(labs[0]);
    }
    
    // Here you would fetch your actual lab data
    // const fetchLabs = async () => {
    //   try {
    //     // Your data fetching logic here
    //   } catch (error) {
    //     console.error("Error fetching labs:", error);
    //   }
    // };
    // fetchLabs();
  }, []);

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726'
    }
  };

  // Format budget data for pie chart
  const getBudgetPieData = () => {
    if (!selectedLab) return [];
    
    return [
      {
        name: "Spent",
        population: selectedLab.totalAmountSpent,
        color: "#FF6384",
        legendFontColor: "#7F7F7F",
        legendFontSize: 12
      },
      {
        name: "Remaining",
        population: Math.max(0, selectedLab.totalApproved - selectedLab.totalAmountSpent),
        color: "#36A2EB",
        legendFontColor: "#7F7F7F",
        legendFontSize: 12
      }
    ];
  };

  // Format equipment expenses for bar chart
  const getEquipmentBarData = () => {
    if (!selectedLab || !selectedLab.equipmentExpenses) {
      return {
        labels: [],
        datasets: [{ data: [] }]
      };
    }

    return {
      labels: selectedLab.equipmentExpenses.map(item => item.name),
      datasets: [
        {
          data: selectedLab.equipmentExpenses.map(item => item.amountSpent)
        }
      ]
    };
  };

  // Department budget comparison
  const getDepartmentComparison = () => {
    // Group labs by department and calculate total budget
    const departments = {};
    labs.forEach(lab => {
      if (!departments[lab.department]) {
        departments[lab.department] = {
          approved: 0,
          spent: 0
        };
      }
      departments[lab.department].approved += lab.totalApproved || 0;
      departments[lab.department].spent += lab.totalAmountSpent || 0;
    });

    return {
      labels: Object.keys(departments),
      datasets: [
        {
          data: Object.values(departments).map(d => d.spent),
          color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
          strokeWidth: 2
        },
        {
          data: Object.values(departments).map(d => d.approved),
          color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
          strokeWidth: 2
        }
      ],
      legend: ["Spent", "Approved"]
    };
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Text className="text-center font-bold text-lg py-4">Lab Budget Analytics</Text>

      {/* Horizontal Lab Selector */}
      <View className="mb-4">
        <Text className="text-gray-700 font-semibold px-4 mb-2">Select Lab</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        >
          {labs.map((lab) => (
            <TouchableOpacity
              key={lab.labId}
              onPress={() => setSelectedLab(lab)}
              className={`px-4 py-3 mx-2 rounded-lg ${
                selectedLab?.labId === lab.labId ? 'bg-blue-500' : 'bg-white'
              } shadow`}
            >
              <Text
                className={`font-medium ${
                  selectedLab?.labId === lab.labId ? 'text-white' : 'text-gray-800'
                }`}
              >
                {lab.labName}
              </Text>
              <Text
                className={`text-xs ${
                  selectedLab?.labId === lab.labId ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {lab.department}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {selectedLab ? (
        <ScrollView className="flex-1 px-4">
          {/* Lab Info Card */}
          <View className="bg-white p-4 rounded-lg shadow mb-4">
            <Text className="font-bold text-lg">{selectedLab.labName}</Text>
            <View className="flex-row justify-between mt-2">
              <Text className="text-gray-700">Department: {selectedLab.department}</Text>
              <Text className="text-gray-700">Location: {selectedLab.location}</Text>
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="text-gray-700">Approved: ₹{selectedLab.totalApproved?.toLocaleString() || 0}</Text>
              <Text className="text-gray-700">Spent: ₹{selectedLab.totalAmountSpent?.toLocaleString() || 0}</Text>
            </View>
          </View>

          {/* Budget Usage Pie Chart */}
          <View className="bg-white p-4 rounded-lg shadow mb-4">
            <Text className="font-semibold text-gray-800 mb-2">Budget Utilization</Text>
            <PieChart
              data={getBudgetPieData()}
              width={screenWidth - 40}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
            />
          </View>

          {/* Equipment Expenses Bar Chart */}
          <View className="bg-white p-4 rounded-lg shadow mb-4">
            <Text className="font-semibold text-gray-800 mb-2">Equipment Expenses</Text>
            <BarChart
              data={getEquipmentBarData()}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(71, 131, 192, ${opacity})`,
              }}
              verticalLabelRotation={30}
              fromZero={true}
            />
          </View>

          {/* Department Comparison */}
          <View className="bg-white p-4 rounded-lg shadow mb-4">
            <Text className="font-semibold text-gray-800 mb-2">Department Budget Comparison</Text>
            <LineChart
              data={getDepartmentComparison()}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
            />
          </View>

          {/* Equipment List */}
          <View className="bg-white p-4 rounded-lg shadow mb-4">
            <Text className="font-semibold text-gray-800 mb-2">Equipment Details</Text>
            {selectedLab.equipmentExpenses?.map((item, index) => (
              <View key={index} className="flex-row justify-between py-2 border-b border-gray-100">
                <View className="flex-1">
                  <Text className="font-medium">{item.name}</Text>
                  <Text className="text-xs text-gray-500">Quantity: {item.approvedQuantity}</Text>
                </View>
                <Text className="font-medium">₹{item.amountSpent?.toLocaleString() || 0}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 justify-center items-center">
          <MaterialIcons name="bar-chart" size={48} color="#ccc" />
          <Text className="text-gray-400 mt-2">Select a lab to view analytics</Text>
        </View>
      )}
    </View>
  );
};

export default Analytics;