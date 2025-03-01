import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { db, approvedRequestsRef, labsRef } from '@/firebaseConfig';
import { getDocs, query, where, Timestamp } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker'; // Import DateTimePicker
import { Feather } from '@expo/vector-icons';

const Budget = () => {
  const [loading, setLoading] = useState(true);
  const [labs, setLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState(null);
  const [budgetData, setBudgetData] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  const [chartData, setChartData] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false); // State for start date picker
  const [showEndDatePicker, setShowEndDatePicker] = useState(false); // State for end date picker

  // Fetch labs data
  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const labSnapshot = await getDocs(labsRef);
        const labsList = labSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLabs(labsList);
        if (labsList.length > 0) {
          setSelectedLab(labsList[0]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching labs:', error);
        Alert.alert('Error', 'Failed to fetch lab data. Please try again.');
        setLoading(false);
      }
    };

    fetchLabs();
  }, []);

  // Fetch budget data when selected lab changes or date range changes
  useEffect(() => {
    if (selectedLab) {
      fetchBudgetData();
    }
  }, [selectedLab, startDate, endDate]);

  // Process budget data and prepare chart data
  useEffect(() => {
    if (budgetData.length > 0) {
      prepareChartData();
      calculateTotalSpent();
    } else {
      setChartData([]);
      setTotalSpent(0);
    }
  }, [budgetData]);

  const fetchBudgetData = async () => {
    setLoading(true);
    try {
      // Convert dates to Firestore Timestamp
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);

      // Query to get approved requests for the selected lab within date range
      const requestsQuery = query(
        approvedRequestsRef,
        where('labId', '==', selectedLab.id),
        where('approvedAt', '>=', startTimestamp),
        where('approvedAt', '<=', endTimestamp)
      );

      const requestsSnapshot = await getDocs(requestsQuery);
      const requestsData = requestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setBudgetData(requestsData);
    } catch (error) {
      console.error('Error fetching budget data:', error);
      Alert.alert('Error', 'Failed to fetch budget data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalSpent = () => {
    const total = budgetData.reduce((sum, request) => sum + (request.totalAmountSpent || 0), 0);
    setTotalSpent(total);
  };

  const prepareChartData = () => {
    const equipmentTotals = {};

    budgetData.forEach(request => {
      request.equipmentExpenses?.forEach(expense => {
        const equipmentName = expense.name;
        const amount = parseFloat(expense.amountSpent) || 0;

        equipmentTotals[equipmentName] = (equipmentTotals[equipmentName] || 0) + amount;
      });
    });

    const data = Object.keys(equipmentTotals).map((key, index) => ({
      value: equipmentTotals[key],
      label: key,
      frontColor: getColor(index),
    }));

    setChartData(data);
  };

  const getColor = (index) => {
    const colors = ['#177AD5', '#ED6665', '#2ecc71', '#9b59b6', '#f1c40f', '#1abc9c', '#e67e22'];
    return colors[index % colors.length];
  };

  const formatDate = (date) => {
    return date.toLocaleDateString(); // More user-friendly date format
  };

  const handleDateChange = (event, selectedDate, isStartDate) => {
    if (event.type === 'set') {
      const currentDate = selectedDate || (isStartDate ? startDate : endDate);
      if (isStartDate) {
        setStartDate(currentDate);
      } else {
        setEndDate(currentDate);
      }
    }

    // Hide the date picker
    if (isStartDate) {
      setShowStartDatePicker(false);
    } else {
      setShowEndDatePicker(false);
    }
  };

  const exportToExcel = async () => {
    if (budgetData.length === 0) {
      Alert.alert('No Data', 'There is no data to export for the selected period.');
      return;
    }

    setExportLoading(true);

    try {
      // Simulate export process
      setTimeout(() => {
        Alert.alert(
          'Export Simulated',
          'In the full implementation, this would export an Excel file with your budget data.'
        );
        setExportLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      Alert.alert('Export Failed', 'An error occurred while exporting the data.');
      setExportLoading(false);
    }
  };

  const renderLabSelector = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-4 px-2 bg-white border-b border-gray-200">
      {labs.map(lab => (
        <TouchableOpacity
          key={lab.id}
          className={`px-3 py-2 mx-1 rounded-lg ${selectedLab?.id === lab.id ? 'bg-blue-100 border border-blue-500' : 'bg-gray-100'}`}
          onPress={() => setSelectedLab(lab)}
        >
          <Text className="text-base font-semibold text-center">{lab.labName}</Text>
          <Text className="text-xs text-gray-500 mt-1 text-center">{lab.department}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderDatePickers = () => (
    <View className="flex-row justify-between p-4 bg-white mt-2 mx-2 rounded-lg shadow-sm">
      <View className="flex-1 mx-1">
        <Text className="text-sm text-gray-500 mb-1">Start Date:</Text>
        <TouchableOpacity
          className="bg-gray-100 p-2 rounded border border-gray-300"
          onPress={() => setShowStartDatePicker(true)}
        >
          <Text className="text-sm text-gray-800">{formatDate(startDate)}</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 mx-1">
        <Text className="text-sm text-gray-500 mb-1">End Date:</Text>
        <TouchableOpacity
          className="bg-gray-100 p-2 rounded border border-gray-300"
          onPress={() => setShowEndDatePicker(true)}
        >
          <Text className="text-sm text-gray-800">{formatDate(endDate)}</Text>
        </TouchableOpacity>
      </View>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => handleDateChange(event, date, true)}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => handleDateChange(event, date, false)}
        />
      )}
    </View>
  );

  const renderExportButton = () => (
    <View className="mx-2 mt-2">
      <TouchableOpacity
        className="bg-green-500 p-3 rounded-lg items-center justify-center flex-row"
        onPress={exportToExcel}
        disabled={exportLoading || budgetData.length === 0}
      >
        {exportLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <View className="flex-row items-center">
            <Feather name="download" size={18} color="white" />
            <Text className="text-white font-semibold ml-2">Export to Excel</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderBudgetSummary = () => (
    <View className="flex-row justify-between mx-2 mt-4">
      <View className="bg-blue-500 rounded-lg p-4 flex-1 mr-1 shadow-sm">
        <Text className="text-xl font-bold text-white">₹{totalSpent.toLocaleString()}</Text>
        <Text className="text-sm text-blue-200 mt-1">Total Budget Spent</Text>
      </View>

      <View className="bg-white rounded-lg p-4 flex-1 ml-1 shadow-sm">
        <Text className="text-base font-bold text-gray-800">Expenses Breakdown</Text>
        <Text className="text-xs text-gray-500 mt-1">
          {formatDate(startDate)} to {formatDate(endDate)}
        </Text>
      </View>
    </View>
  );

  const renderExpensesChart = () => {
    if (chartData.length === 0) {
      return (
        <View className="bg-white p-5 m-2 rounded-lg items-center justify-center h-24 shadow-sm">
          <Text className="text-base text-gray-500 text-center">No expense data available for the selected period</Text>
        </View>
      );
    }

    return (
      <View className="bg-white m-2 p-4 rounded-lg shadow-sm">
        <Text className="text-lg font-bold text-gray-800 mb-2">Equipment Expenses</Text>
        <BarChart
          data={chartData}
          width={300}
          height={200}
          barWidth={22}
          spacing={20}
          roundedTop
          roundedBottom
          hideRules
          xAxisThickness={1}
          yAxisThickness={1}
          xAxisLabelTextStyle={{ fontSize: 10, color: '#666' }}
          yAxisTextStyle={{ fontSize: 10, color: '#666' }}
          noOfSections={5}
          showFractionalValues
          showGradient
          showYAxisIndices
          yAxisIndicesHeight={2}
          yAxisIndicesWidth={3}
          yAxisIndicesColor="#177AD5"
          labelWidth={40}
        />
      </View>
    );
  };

  const renderExpensesList = () => {
    if (budgetData.length === 0) {
      return (
        <View className="bg-white p-5 m-2 rounded-lg items-center justify-center h-24 shadow-sm">
          <Text className="text-base text-gray-500 text-center">No expense data available for the selected period</Text>
        </View>
      );
    }

    return (
      <View className="mb-5">
        <Text className="text-lg font-bold text-gray-800 mb-2 mx-2 mt-4">Detailed Expenses</Text>
        {budgetData.map(request => (
          <View key={request.id} className="bg-white rounded-lg p-4 mx-2 mb-2 shadow-sm">
            <View className="flex-row justify-between mb-2 border-b border-gray-100 pb-2">
              <Text className="text-sm text-gray-500">
                {new Date(request.approvedAt?.toDate()).toLocaleDateString()}
              </Text>
              <Text className="text-base font-bold text-blue-500">
                ₹{request.totalAmountSpent?.toLocaleString() || '0'}
              </Text>
            </View>

            {request.equipmentExpenses?.map((expense, index) => (
              <View key={index} className="flex-row justify-between py-1">
                <View className="flex-1">
                  <Text className="text-base text-gray-800">{expense.name}</Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    Qty: {expense.approvedQuantity || 0}
                  </Text>
                </View>
                <Text className="text-base font-medium text-gray-800">
                  ₹{expense.amountSpent || '0'}
                </Text>
              </View>
            ))}

            {request.invoiceUrl && (
              <TouchableOpacity className="bg-gray-100 py-2 rounded items-center mt-2">
                <Text className="text-gray-600 font-medium">View Invoice</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    );
  };

  if (loading && labs.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-3 text-base text-gray-500">Loading lab data...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-5 bg-blue-500">
        <Text className="text-2xl font-bold text-white">Lab Budget Tracker</Text>
        <Text className="text-base text-blue-200 mt-1">Monitor equipment expenses</Text>
      </View>

      {renderLabSelector()}
      {renderDatePickers()}
      {renderExportButton()}

      {loading ? (
        <View className="justify-center items-center p-5 h-48">
          <ActivityIndicator size="medium" color="#3b82f6" />
          <Text className="mt-3 text-base text-gray-500">Loading budget data...</Text>
        </View>
      ) : (
        <>
          {renderBudgetSummary()}
          {renderExpensesChart()}
          {renderExpensesList()}
        </>
      )}
    </ScrollView>
  );
};

export default Budget;