import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { db, requestsRef } from '@/firebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useRouter } from 'expo-router';

const InsightCard = ({ title, value, subtitle, icon, color = "blue" }) => (
  <View className={`bg-white p-4 rounded-2xl border-l-4 border-${color}-500`}>
    <View className="flex-row justify-between items-start">
      <View className="flex-1">
        <Text className="text-sm text-gray-600">{title}</Text>
        <Text className="text-xl font-bold mt-1">
          {typeof value === 'number' ? `₹${value.toLocaleString()}` : value}
        </Text>
        {subtitle && (
          <Text className="text-xs text-gray-500 mt-1">{subtitle}</Text>
        )}
      </View>
      <View className={`w-10 h-10 rounded-full bg-${color}-50 items-center justify-center`}>
        <Feather name={icon} size={20} color={`${color === 'blue' ? '#3B82F6' : color === 'green' ? '#10B981' : '#8B5CF6'}`} />
      </View>
    </View>
  </View>
);

const RequestCard = ({ request, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-white p-4 rounded-2xl mb-3"
  >
    <View className="flex-row justify-between items-start mb-2">
      <View className="flex-1">
        <Text className="font-medium text-gray-900">{request.title}</Text>
        <Text className="text-sm text-gray-500 mt-1">{request.username}</Text>
      </View>
      <Text className="text-blue-500 font-bold">₹{request.totalAmount?.toLocaleString()}</Text>
    </View>
    <View className="flex-row items-center mt-2">
      <View className="flex-row items-center">
        <Feather name="calendar" size={14} color="#6B7280" />
        <Text className="text-xs text-gray-500 ml-1">
          {new Date(request.approvedAt).toLocaleDateString()}
        </Text>
      </View>
      <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
      <View className="flex-row items-center">
        <Feather name="package" size={14} color="#6B7280" />
        <Text className="text-xs text-gray-500 ml-1">
          {request.equipment?.length || 0} items
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

const BudgetTracker = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [insights, setInsights] = useState({
    totalSpent: 0,
    monthlyAverage: 0,
    topCategory: '',
    recentTrend: 0,
    categoryBreakdown: {},
    monthlyTrend: []
  });
  const router = useRouter();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const q = query(
        collection(db, 'Requests'),
        where('status', '==', 'approved'),
        orderBy('approvedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const requestsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRequests(requestsData);
      calculateInsights(requestsData);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateInsights = (requestsData) => {
    // Total spent
    const totalSpent = requestsData.reduce((sum, req) => sum + (req.totalAmount || 0), 0);

    // Monthly breakdown
    const monthlySpending = {};
    requestsData.forEach(req => {
      const month = new Date(req.approvedAt).toLocaleString('default', { month: 'short' });
      monthlySpending[month] = (monthlySpending[month] || 0) + (req.totalAmount || 0);
    });

    // Category breakdown
    const categorySpending = {};
    requestsData.forEach(req => {
      req.equipment?.forEach(item => {
        categorySpending[item.type] = (categorySpending[item.type] || 0) +
          (parseFloat(item.amountSpent) || 0);
      });
    });

    // Calculate monthly average
    const months = Object.keys(monthlySpending).length;
    const monthlyAverage = months > 0 ? totalSpent / months : 0;

    // Calculate trend (comparing last two months)
    const sortedMonths = Object.entries(monthlySpending)
      .sort((a, b) => new Date(b[0]) - new Date(a[0]));
    const recentTrend = sortedMonths.length >= 2
      ? ((sortedMonths[0][1] - sortedMonths[1][1]) / sortedMonths[1][1]) * 100
      : 0;

    // Find top category
    const topCategory = Object.entries(categorySpending)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    setInsights({
      totalSpent,
      monthlyAverage,
      topCategory,
      recentTrend,
      categoryBreakdown: categorySpending,
      monthlyTrend: Object.entries(monthlySpending)
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Loading budget data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4">
        <Text className="text-2xl font-bold text-gray-900">Budget Tracker</Text>
        <Text className="text-gray-500">Monitor and analyze expenses</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Key Metrics */}
        <View className="space-y-3 mb-6">
          <InsightCard
            title="Total Budget Spent"
            value={insights.totalSpent}
            subtitle={`${insights.recentTrend > 0 ? '↑' : '↓'} ${Math.abs(insights.recentTrend).toFixed(1)}% vs last month`}
            icon="dollar-sign"
            color="blue"
          />
          <InsightCard
            title="Monthly Average"
            value={insights.monthlyAverage}
            subtitle="Based on approved requests"
            icon="trending-up"
            color="green"
          />
          <InsightCard
            title="Top Expense Category"
            value={insights.topCategory || 'N/A'}
            subtitle="Highest spending category"
            icon="pie-chart"
            color="purple"
          />
        </View>

        {/* Category Breakdown */}
        <View className="bg-white rounded-2xl p-4 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">Category Breakdown</Text>
          {Object.entries(insights.categoryBreakdown).map(([category, amount]) => (
            <View key={category} className="mb-3">
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600 capitalize">{category}</Text>
                <Text className="font-medium">₹{amount.toLocaleString()}</Text>
              </View>
              <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <View
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${(amount / insights.totalSpent) * 100}%`
                  }}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Recent Requests */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">Recent Approvals</Text>
          {requests.map(request => (
            <RequestCard
              key={request.id}
              request={request}
              onPress={() => router.push({
                pathname: "/(admin)/invoice",
                params: { requestId: request.id }
              })}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BudgetTracker;
