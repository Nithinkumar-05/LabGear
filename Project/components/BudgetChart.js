import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, approvedRequestsRef } from '@/firebaseConfig'; 

const BudgetTracker = () => {
  const [completedRequests, setCompletedRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [monthlyApprovals, setMonthlyApprovals] = useState([]);
  const [equipmentSpending, setEquipmentSpending] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const completedQuery = query(
          approvedRequestsRef,
          where('status', '==', 'completed')
        );
        
        // Query for approved requests (for trend analysis)
        const approvedQuery = query(
          collection(db, 'approvedRequests'),
          where('status', '==', 'approved')
        );
        
        const [completedSnapshot, approvedSnapshot] = await Promise.all([
          getDocs(completedQuery),
          getDocs(approvedQuery)
        ]);
        
        const completed = [];
        completedSnapshot.forEach((doc) => {
          completed.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        const approved = [];
        approvedSnapshot.forEach((doc) => {
          approved.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setCompletedRequests(completed);
        setApprovedRequests(approved);
        
        // Process data for spending analysis
        processCompletedRequests(completed);
        
        // Process data for monthly approval trends
        processApprovalTrends(approved);
        
      } catch (err) {
        console.error("Error fetching budget data:", err);
        setError("Failed to load budget data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Process completed requests to calculate total spending
  const processCompletedRequests = (requests) => {
    // Create spending data by equipment type
    const equipmentCosts = {};
    let totalSpent = 0;
    
    requests.forEach(request => {
      // Use equipmentExpenses array if available
      if (request.equipmentExpenses && Array.isArray(request.equipmentExpenses)) {
        request.equipmentExpenses.forEach(item => {
          const name = item.name ? item.name.trim() : 'Unknown';
          // Use actual amountSpent from the data
          const cost = parseFloat(item.amountSpent || 0);
          
          totalSpent += cost;
          
          if (!equipmentCosts[name]) {
            equipmentCosts[name] = 0;
          }
          equipmentCosts[name] += cost;
        });
      } 
      // Fallback to equipment array if equipmentExpenses not available
      else if (request.equipment && Array.isArray(request.equipment)) {
        request.equipment.forEach(item => {
          const name = item.name ? item.name.trim() : 'Unknown';
          // Use totalAmountSpent if available, otherwise estimate
          const cost = request.totalAmountSpent 
            ? (request.totalAmountSpent / request.equipment.length) 
            : (getEquipmentCost(item.name) * (item.approvedQuantity || 0));
          
          totalSpent += cost;
          
          if (!equipmentCosts[name]) {
            equipmentCosts[name] = 0;
          }
          equipmentCosts[name] += cost;
        });
      }
    });
    
    // Convert to format for gifted-charts
    const spendingData = Object.keys(equipmentCosts).map(name => {
      return {
        value: equipmentCosts[name],
        label: name,
        frontColor: generateColor(name),
        equipmentName: name,
        cost: equipmentCosts[name]
      };
    });
    
    setEquipmentSpending(spendingData);
  };
  
  // Process approval trends over months
  const processApprovalTrends = (requests) => {
    // Group approvals by month
    const monthlyData = {};
    
    requests.forEach(request => {
      if (request.approvedAt) {
        const date = new Date(request.approvedAt);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            count: 0,
            items: 0,
            month: date.getMonth() + 1,
            year: date.getFullYear(),
            timestamp: date.getTime()
          };
        }
        
        monthlyData[monthYear].count += 1;
        
        if (request.equipment && Array.isArray(request.equipment)) {
          request.equipment.forEach(item => {
            monthlyData[monthYear].items += (item.approvedQuantity || 0);
          });
        }
      }
    });
    
    // Convert to array and sort by date
    const trendData = Object.values(monthlyData)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((data, index) => {
        const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthLabel = `${shortMonthNames[data.month - 1]}'${data.year.toString().substr(2)}`;
        
        return {
          value: data.items,
          dataPointText: data.items.toString(),
          label: monthLabel,
          count: data.count
        };
      });
    
    setMonthlyApprovals(trendData);
  };
  
  // Function to get equipment cost based on type
  const getEquipmentCost = (name) => {
    // Dummy estimation based on equipment name
    const lowerName = name ? name.toLowerCase() : '';
    if (lowerName.includes('printer')) return 5200;
    if (lowerName.includes('projector')) return 22500;
    if (lowerName.includes('keyboard')) return 1200;
    if (lowerName.includes('computer')) return 45000;
    if (lowerName.includes('monitor')) return 8500;
    return 1000; // Default fallback price
  };
  
  // Function to generate consistent colors based on name
  const generateColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const r = (hash & 0xFF) % 200 + 55;
    const g = ((hash >> 8) & 0xFF) % 200 + 55;
    const b = ((hash >> 16) & 0xFF) % 200 + 55;
    
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  // Calculate total spending
  const totalSpent = equipmentSpending.reduce((acc, item) => acc + item.value, 0);
  
  // Count total completed requests
  const totalCompletedRequests = completedRequests.length;
  
  const screenWidth = Dimensions.get('window').width - 40;
  
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4b5563" />
        <Text className="mt-4 text-gray-600">Loading budget data...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-lg">{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-2 bg-gray-100">
      <View className="bg-gray-50 rounded-lg shadow-md p-4 mb-4">
        <Text className="text-lg font-bold mb-2">Budget Summary</Text>
        <Text className="text-gray-700">Total Completed Requests: {totalCompletedRequests}</Text>
        <Text className="text-gray-700">Total Budget Spent: ₹{totalSpent.toFixed(2)}</Text>
        <Text className="text-gray-700">Average Cost per Request: ₹{totalCompletedRequests > 0 ? (totalSpent / totalCompletedRequests).toFixed(2) : 0}</Text>
      </View>
      
      {monthlyApprovals.length > 0 ? (
        <View className="bg-gray-50 rounded-lg shadow-md p-4 mb-4">
          <Text className="text-lg font-bold mb-4">Monthly Equipment Approval Trends</Text>
          
          <View style={{ paddingVertical: 10 }}>
            <LineChart
              data={monthlyApprovals}
              width={screenWidth - 20}
              height={220}
              spacing={40}
              color="#4b0082"
              thickness={3}
              startFillColor="rgba(75, 0, 130, 0.3)"
              endFillColor="rgba(75, 0, 130, 0.01)"
              initialSpacing={10}
              yAxisThickness={1}
              xAxisThickness={1}
              xAxisLabelTextStyle={{ fontSize: 10 }}
              hideRules
              yAxisTextStyle={{ fontSize: 10 }}
              noOfSections={5}
              hideDataPoints={false}
              dataPointsColor="#4b0082"
              dataPointsRadius={5}
              focusEnabled
              showFractionalValues={false}
              showTextOnDataPoints={false}
              textShiftY={-15}
              textShiftX={-5}
              textFontSize={13}
            />
          </View>
          
          <Text className="text-sm text-gray-500 text-center mt-2">Equipment items approved by month</Text>
        </View>
      ) : (
        <View className="bg-gray-50 rounded-lg shadow-md p-4 mb-4">
          <Text className="text-center text-gray-500">No monthly approval data available</Text>
        </View>
      )}
      
      {equipmentSpending.length > 0 ? (
        <View className="mb-4">
          <Text className="text-lg font-bold mb-4  text-center">Budget Allocation by Equipment</Text>
          
          <View style={{ paddingVertical: 10,paddingBlockEnd: 10 }}>
            <BarChart
              data={equipmentSpending}
              width={screenWidth - 50}
              height={220}
              barWidth={30}
              spacing={24}
              barBorderRadius={4}
              showGradient
              yAxisThickness={1}
              xAxisThickness={1}
              xAxisLabelTextStyle={{ fontSize: 10, textAlign: 'center' }}
              rotateLabel
              hideRules
              yAxisTextStyle={{ fontSize: 10 }}
              noOfSections={5}
              maxValue={Math.max(...equipmentSpending.map(item => item.value)) * 1.2}
              yAxisLabelPrefix="₹"
              renderTooltip={(item, index) => (
                <View style={{
                  backgroundColor: 'white',
                  padding: 8,
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: '#ddd',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}>
                  <Text style={{ fontWeight: 'bold' }}>{item.equipmentName}</Text>
                  <Text>Cost: ₹{item.cost.toFixed(2)}</Text>
                </View>
              )}
            />
          </View>
          
          {/* Spending breakdown */}
          <View className="mt-6">
            <Text className="font-bold mb-2">Spending Breakdown</Text>
            {equipmentSpending.map((item, index) => (
              <View key={index} className="flex-row justify-between items-center mb-2 border-b border-gray-100 pb-2">
                <View className="flex-row items-center">
                  <View 
                    style={{ 
                      width: 12, 
                      height: 12, 
                      backgroundColor: item.frontColor,
                      marginRight: 8,
                      borderRadius: 2
                    }} 
                  />
                  <Text>{item.equipmentName}</Text>
                </View>
                <Text className="font-medium">₹{item.cost.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View className="bg-white rounded-lg shadow-md p-4 mb-4">
          <Text className="text-center text-gray-500">No spending data available</Text>
        </View>
      )}
      
      
    </ScrollView>
  );
};

export default BudgetTracker;


// <View className="bg-white rounded-lg shadow-md p-4 mb-4">
//         <Text className="text-lg font-bold mb-2">Completed Requests</Text>
//         {completedRequests.length > 0 ? (
//           completedRequests.map((request) => (
//             <View key={request.id} className="border-b border-gray-200 py-2">
//               <Text className="font-medium">Request ID: {request.requestId}</Text>
//               <Text className="text-gray-600">
//                 Completed: {request.completedAt ? new Date(request.completedAt).toLocaleDateString() : 'Unknown'}
//               </Text>
//               <Text className="text-gray-600">Approved: {request.approvedAt ? new Date(request.approvedAt).toLocaleDateString() : 'Unknown'}</Text>
//               <Text className="text-gray-600 mb-2">Lab ID: {request.labId}</Text>
//               {request.invoiceUrl && (
//                 <Text className="text-blue-600 mb-2">Invoice Available</Text>
//               )}
//               <Text className="font-medium mb-1">Total Amount Spent: ₹{request.totalAmountSpent || 0}</Text>
              
//               {/* Show equipment expenses if available */}
//               {request.equipmentExpenses && request.equipmentExpenses.length > 0 ? (
//                 <>
//                   <Text className="font-medium mt-1">Equipment Expenses:</Text>
//                   {request.equipmentExpenses.map((item, index) => (
//                     <View key={index} className="ml-4 mb-1">
//                       <Text>
//                         {item.name}: {item.approvedQuantity} units = ₹{item.amountSpent}
//                       </Text>
//                     </View>
//                   ))}
//                 </>
//               ) : (
//                 request.equipment && request.equipment.map((item, index) => {
//                   const amountPerItem = request.totalAmountSpent 
//                     ? (request.totalAmountSpent / request.equipment.length).toFixed(2) 
//                     : getEquipmentCost(item.name);
                  
//                   return (
//                     <View key={index} className="ml-4 mb-1">
//                       <Text>
//                         {item.name}: {item.approvedQuantity} units × ₹{(amountPerItem / item.approvedQuantity).toFixed(2)} = ₹{amountPerItem}
//                       </Text>
//                     </View>
//                   );
//                 })
//               )}
//             </View>
//           ))
//         ) : (
//           <Text className="text-center text-gray-500">No completed requests found</Text>
//         )}
//       </View>