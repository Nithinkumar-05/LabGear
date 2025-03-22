import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';

const Requests = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('pending');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests(activeTab);
  }, [activeTab]);

  const fetchRequests = async (status) => {
    try {
      setLoading(true);
      
      const requestsRef = collection(db, 'Requests');
      let q;
      
      if (status === 'approved') {
        q = query(
          requestsRef,
          where('status', 'in', ['approved', 'partially approved'])
        );
      } else {
        q = query(
          requestsRef,
          where('status', '==', status)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const requestsList = [];
      
      querySnapshot.forEach((doc) => {
        requestsList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setRequests(requestsList);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderTabButton = (tab, label, icon) => (
    <TouchableOpacity
      onPress={() => handleTabChange(tab)}
      className={`flex-1 py-3 flex-row justify-center items-center ${
        activeTab === tab ? 'border-b-2 border-indigo-600' : 'border-b border-gray-200'
      }`}
    >
      {icon}
      <Text className={`ml-2 font-medium ${
        activeTab === tab ? 'text-indigo-600' : 'text-gray-600'
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-10">
      <MaterialIcons name="inbox" size={56} color="#D1D5DB" />
      <Text className="mt-4 text-gray-500 text-lg font-medium">
        No {activeTab === 'approved' ? 'approved or partially approved' : activeTab} requests found
      </Text>
    </View>
  );

  const renderRequestItem = ({ item }) => (
    <TouchableOpacity
      onPress= {() => router.push({
        pathname: "/(stockmanager)/requestsummary",
        params: { requestId: item.id },
      })}
      className="bg-white mb-3 rounded-xl overflow-hidden shadow-sm"
    >
            
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-gray-800 font-semibold">
            Request #{item.id.slice(0, 6)}
          </Text>
          <View className={`px-2 py-1 rounded-full ${
            item.status === 'approved' || item.status === 'partially approved' ? 'bg-green-100' :
            item.status === 'pending' ? 'bg-amber-100' : 'bg-red-100'
          }`}>
            <Text className={`text-xs font-medium ${
              item.status === 'approved' || item.status === 'partially approved' ? 'text-green-600' :
              item.status === 'pending' ? 'text-amber-500' : 'text-red-500'
            }`}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600 text-sm">Requested by:</Text>
          <Text className="text-gray-800 text-sm font-medium">{item.username}</Text>
        </View>
        
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600 text-sm">Lab ID:</Text>
          <Text className="text-gray-800 text-sm font-medium">{item.labId}</Text>
        </View>
        
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600 text-sm">Date:</Text>
          <Text className="text-gray-800 text-sm font-medium">
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        
        <Text className="text-gray-600 text-sm mb-2">Items:</Text>
        <View className="bg-gray-50 p-2 rounded-md">
          {item.equipment.slice(0, 2).map((equip, idx) => (
            <Text key={idx} className="text-gray-700 text-sm">
              • {equip.name} (x{equip.quantity})
            </Text>
          ))}
          {item.equipment.length > 2 && (
            <Text className="text-gray-500 text-sm italic">
              +{item.equipment.length - 2} more items
            </Text>
          )}
        </View>
        
        {item.status === 'rejected' && item.rejectionReason && (
          <View className="mt-2 bg-red-50 p-2 rounded-md">
            <Text className="text-red-600 text-sm">
              Reason: {item.rejectionReason.length > 50 
                ? item.rejectionReason.substring(0, 50) + '...' 
                : item.rejectionReason}
            </Text>
          </View>
        )}
      </View>
      
      <View className="bg-gray-50 py-2 px-4 flex-row justify-between items-center">
        <Text className="text-gray-500 text-xs">
          {(item.status === 'approved' || item.status === 'partially approved')
            ? `Approved ${new Date(item.approvedAt).toLocaleDateString()}` 
            : item.status === 'rejected'
              ? `Rejected ${new Date(item.rejectedAt).toLocaleDateString()}`
              : 'Awaiting review'}
        </Text>
        <View className="flex-row items-center">
          <Text className="text-indigo-600 text-sm mr-1">View Details</Text>
          <AntDesign name="right" size={12} color="#4F46E5" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-white py-4 px-4 shadow-sm">
        <Text className="text-xl font-bold text-gray-800">Inventory Requests</Text>
      </View>
      
      {/* Tabs */}
      <View className="flex-row bg-white">
        {renderTabButton('pending', 'Pending', 
          <MaterialIcons name="pending-actions" size={18} color={activeTab === 'pending' ? '#4F46E5' : '#6B7280'} />
        )}
        {renderTabButton('approved', 'Approved', 
          <MaterialIcons name="check-circle" size={18} color={activeTab === 'approved' ? '#4F46E5' : '#6B7280'} />
        )}
        
      </View>
      
      {/* Content */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="mt-4 text-gray-600">Loading requests...</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default Requests;