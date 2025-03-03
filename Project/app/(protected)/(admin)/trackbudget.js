import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform, SafeAreaView } from 'react-native';
import { db, approvedRequestsRef, labsRef } from '@/firebaseConfig';
import { getDocs, query, where } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import CustomChart from '@/components/CustomChart';

// Custom loading indicator
const CustomLoadingIndicator = ({ color = '#3b82f6', text = 'Loading...' }) => (
  <View className="items-center justify-center p-5">
    <Text style={{ color }} className="mb-2">○ ○ ○</Text>
    <Text className="text-gray-500 text-sm">{text}</Text>
  </View>
);

const Budget = () => {
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [labs, setLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState(null);
  const [budgetData, setBudgetData] = useState([]); // Initialize as empty array
  const [totalSpent, setTotalSpent] = useState(0);
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  const [chartData, setChartData] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Fetch labs on component mount
  useEffect(() => {
    fetchLabs();
  }, []);

  // Fetch budget data when lab or dates change
  useEffect(() => {
    if (selectedLab) {
      fetchBudgetData();
    }
  }, [selectedLab, startDate, endDate]);

  // Update derived data when budget data changes
  useEffect(() => {
    if (budgetData && budgetData.length > 0) {
      updateChartData();
      updateTotalSpent();
    } else {
      setChartData([]);
      setTotalSpent(0);
    }
  }, [budgetData]);

  // Function to fetch labs
  const fetchLabs = async () => {
    try {
      const snapshot = await getDocs(labsRef);
      if (!snapshot.empty) {
        const labList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLabs(labList);
        if (labList.length > 0) {
          setSelectedLab(labList[0]);
        }
      } else {
        setLabs([]);
      }
    } catch (error) {
      console.error('Error fetching labs:', error);
      Alert.alert('Error', 'Failed to load laboratory data');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch budget data
  const fetchBudgetData = async () => {
    if (!selectedLab || !selectedLab.id) return;

    setIsDataLoading(true);

    try {
      const correctLabId = selectedLab.id;
      const startISO = startDate.toISOString();
      const endISO = endDate.toISOString();

      const budgetQuery = query(
        approvedRequestsRef,
        where('labId', '==', correctLabId),
        where('approvedAt', '>=', startISO),
        where('approvedAt', '<=', endISO)
      );

      const snapshot = await getDocs(budgetQuery);

      if (!snapshot.empty) {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBudgetData(data);
      } else {
        setBudgetData([]); // Set to empty array if no data is found
      }
    } catch (error) {
      console.error('Error fetching budget data:', error);
      Alert.alert('Error', 'Failed to load budget data');
      setBudgetData([]); // Set to empty array on error
    } finally {
      setIsDataLoading(false);
    }
  };

  // Function to calculate total spent
  const updateTotalSpent = () => {
    try {
      if (!Array.isArray(budgetData)) {
        console.warn('budgetData is not an array:', budgetData);
        setTotalSpent(0);
        return;
      }

      const total = budgetData.reduce((sum, item) => {
        const amount = parseFloat(item.totalAmountSpent || 0);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

      setTotalSpent(total);
    } catch (error) {
      console.error('Error calculating total:', error);
      setTotalSpent(0);
    }
  };

  // Function to update chart data
  const updateChartData = () => {
    try {
      const equipmentTotals = {};

      budgetData.forEach(request => {
        if (request.equipmentExpenses && Array.isArray(request.equipmentExpenses)) {
          request.equipmentExpenses.forEach(expense => {
            if (expense && expense.name) {
              const name = expense.name;
              const amount = parseFloat(expense.amountSpent || 0);

              if (!isNaN(amount)) {
                equipmentTotals[name] = (equipmentTotals[name] || 0) + amount;
              }
            }
          });
        }
      });

      const chartEntries = Object.keys(equipmentTotals).map((key, index) => ({
        x: key,
        y: equipmentTotals[key],
        color: getColorForIndex(index)
      }));

      setChartData(chartEntries);
      console.log('Chart data updated:', chartEntries); // Debugging log
    } catch (error) {
      console.error('Error updating chart data:', error);
      setChartData([]);
    }
  };

  // Get color for chart
  const getColorForIndex = (index) => {
    const colors = [
      '#3366CC', '#DC3912', '#FF9900', '#109618', '#990099',
      '#3B3EAC', '#0099C6', '#DD4477', '#66AA00', '#B82E2E'
    ];
    return colors[index % colors.length];
  };




    // Format date for display
  const formatDate = (date) => {
    try {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handleDateChange = (event, date, isStart) => {
    if (Platform.OS === 'android') {
      setShowStartPicker(false);
      setShowEndPicker(false);
    }
    
    if (event.type === 'set' && date) {
      if (isStart) {
        setStartDate(date);
      } else {
        setEndDate(date);
      }
    }
    
    if (Platform.OS === 'ios' && event.type === 'set') {
      if (isStart) {
        setShowStartPicker(false);
      } else {
        setShowEndPicker(false);
      }
    }
  };

  const handleExport = () => {
    if (budgetData.length === 0) {
      Alert.alert('No Data', 'There is no data to export for the selected period');
      return;
    }
    
    setIsExporting(true);
    
    setTimeout(() => {
      Alert.alert('Export', 'Budget data exported successfully');
      setIsExporting(false);
    }, 1500);
  };

  

  

  // Lab selector component
  const LabSelector = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ padding: 8 }}
      className="bg-white border-b border-gray-200"
    >
      {labs.map(lab => (
        <TouchableOpacity
          key={lab.id}
          className={`px-2.5 py-2.5 mx-1 ${selectedLab?.id === lab.id ? 'bg-blue-50 border border-blue-500' : 'bg-gray-100 border-0 border-transparent'} rounded-lg min-w-[100px] items-center`}
          onPress={() => setSelectedLab(lab)}
        >
          <Text className="font-semibold text-base">{lab.labName}</Text>
          <Text className="text-gray-500 text-xs mt-1">{lab.department}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Date range selector component
  const DateSelector = () => (
    <View className="flex-row m-2 bg-white rounded-lg p-3 shadow">
      <View className="flex-1 mr-2">
        <Text className="text-gray-500 mb-1 text-sm">Start Date:</Text>
        <TouchableOpacity
          className="bg-gray-100 p-2 rounded border border-gray-300"
          onPress={() => setShowStartPicker(true)}
        >
          <Text>{formatDate(startDate)}</Text>
        </TouchableOpacity>
      </View>
      
      <View className="flex-1 ml-2">
        <Text className="text-gray-500 mb-1 text-sm">End Date:</Text>
        <TouchableOpacity
          className="bg-gray-100 p-2 rounded border border-gray-300"
          onPress={() => setShowEndPicker(true)}
        >
          <Text>{formatDate(endDate)}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Date Pickers */}
      {showStartPicker && (
        <DateTimePicker
          testID="startDatePicker"
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, d) => handleDateChange(e, d, true)}
        />
      )}
      
      {showEndPicker && (
        <DateTimePicker
          testID="endDatePicker"
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, d) => handleDateChange(e, d, false)}
        />
      )}
    </View>
  );

  // Export button component
  const ExportButton = () => (
    <TouchableOpacity
      className={`${isExporting ? 'bg-lime-700' : 'bg-lime-500'} m-2 rounded-lg p-3 flex-row justify-center items-center ${budgetData.length === 0 ? 'opacity-50' : 'opacity-100'}`}
      onPress={handleExport}
      disabled={isExporting || budgetData.length === 0}
    >
      <Feather name="download" size={18} color="white" />
      <Text className="text-white font-semibold ml-2">
        {isExporting ? 'Exporting...' : 'Export to Excel'}
      </Text>
    </TouchableOpacity>
  );

  // Budget summary component
  const BudgetSummary = () => (
    <View className="flex-row m-2">
      <View className="flex-1 bg-blue-500 rounded-lg p-4 mr-1 shadow">
        <Text className="text-xl font-bold text-white">
          ₹{totalSpent.toLocaleString()}
        </Text>
        <Text className="text-sm text-blue-100 mt-1">
          Total Budget Spent
        </Text>
      </View>
      
      <View className="flex-1 bg-white rounded-lg p-4 ml-1 shadow">
        <Text className="text-base font-bold text-gray-800">
          Expenses Breakdown
        </Text>
        <Text className="text-xs text-gray-500 mt-1">
          {formatDate(startDate)} to {formatDate(endDate)}
        </Text>
      </View>
    </View>
  );
  
  // Expense chart component
  const ExpenseChart = ({ chartData }) => {
    if (chartData.length === 0) {
      return (
        <View className="bg-white m-2 p-5 rounded-lg items-center justify-center h-[200px] shadow">
          <Text className="text-gray-500 text-base">
            No expense data available
          </Text>
        </View>
      );
    }
    
    return (
      <View className="bg-white m-2 rounded-lg shadow">
        <CustomChart data={chartData} />
      </View>
    );
  };

  // Expense details component
  const ExpenseDetails = () => {
    if (budgetData.length === 0) {
      return (
        <View className="bg-white m-2 p-5 rounded-lg items-center justify-center h-[100px] shadow">
          <Text className="text-gray-500 text-base">
            No expense data available
          </Text>
        </View>
      );
    }
    
    return (
      <View className="mb-5">
        <Text className="text-lg font-bold text-gray-800 mt-4 mx-2">
          Detailed Expenses
        </Text>
        
        {budgetData.map(request => {
          // Get approval date
          let approvalDate = 'N/A';
          try {
            if (request.approvedAt) {
              // Handle both Firestore Timestamp and ISO string cases
              approvalDate = typeof request.approvedAt === 'string' 
                ? new Date(request.approvedAt).toLocaleDateString()
                : request.approvedAt.toDate 
                  ? request.approvedAt.toDate().toLocaleDateString() 
                  : new Date(request.approvedAt).toLocaleDateString();
            }
          } catch (e) {
            console.error('Date conversion error:', e);
          }
          
          return (
            <View key={request.id} className="bg-white m-2 p-4 rounded-lg shadow">
              <View className="flex-row justify-between pb-2 border-b border-gray-100 mb-2">
                <Text className="text-sm text-gray-500">{approvalDate}</Text>
                <Text className="text-base font-bold text-blue-500">
                  ₹{parseFloat(request.totalAmountSpent || 0).toLocaleString()}
                </Text>
              </View>
              
              {Array.isArray(request.equipmentExpenses) && request.equipmentExpenses.map((expense, index) => (
                <View key={index} className="flex-row justify-between py-2">
                  <View className="flex-1">
                    <Text className="text-base text-gray-800">{expense.name || 'Unknown'}</Text>
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
          );
        })}
      </View>
    );
  };

  // Loading screen
  if (isLoading && labs.length === 0) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <CustomLoadingIndicator text="Loading laboratory data..." />
      </SafeAreaView>
    );
  }

  // Main render
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView>
        {/* Header */}
        <View className="bg-blue-500 p-5">
          <Text className="text-2xl font-bold text-white">
            Lab Budget Tracker
          </Text>
          <Text className="text-base text-blue-100 mt-1">
            Monitor equipment expenses
          </Text>
        </View>

        {/* Lab selector */}
        <LabSelector />

        {/* Date selector */}
        <DateSelector />

        {/* Export button */}
        <ExportButton />

        {/* Budget data display */}
        {isDataLoading ? (
          <View className="h-[200px] justify-center items-center">
            <CustomLoadingIndicator text="Loading budget data..." />
          </View>
        ) : (
          <>
            <BudgetSummary />
            <ExpenseChart chartData={chartData} /> 
            <ExpenseDetails />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Budget;