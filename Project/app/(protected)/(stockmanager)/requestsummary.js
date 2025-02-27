import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { AntDesign, MaterialIcons, Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, updateDoc, collection, getDocs,addDoc } from 'firebase/firestore';
import { db, componentsRef,requestsRef,approvedRequestsRef as approvedRef} from '@/firebaseConfig';
import { useAuth } from '@/routes/AuthContext';
const RequestSummary = () => {
  const router = useRouter();
  const { requestId } = useLocalSearchParams();
  const {user} = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState({});
  const [approvedQuantities, setApprovedQuantities] = useState({});
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [inventoryLoading, setInventoryLoading] = useState(true);

  // Fetch request details
  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        const requestRef = doc(requestsRef, requestId);
        const requestSnap = await getDoc(requestRef);
        if (requestSnap.exists()) {
          const requestData = { id: requestSnap.id, ...requestSnap.data() };
          setRequest(requestData);
          
          // Initialize approved quantities with requested quantities
          const initialQuantities = {};
          requestData.equipment.forEach(item => {
            initialQuantities[item.equipmentId] = item.quantity;
          });
          setApprovedQuantities(initialQuantities);
        } else {
          Alert.alert('Error', 'Request not found');
          router.back();
        }
      } catch (error) {
        console.error('Error fetching request details:', error);
        Alert.alert('Error', 'Failed to load request details');
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchRequestDetails();
    }
  }, [requestId]);

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setInventoryLoading(true);
        const inventorySnap = await getDocs(componentsRef);
        const inventoryMap = {};
        
        inventorySnap.docs.forEach(doc => {
          const item = doc.data();
          inventoryMap[doc.id] = {
            id: doc.id,
            name: item.name,
            quantity: item.quantity || 0,
            type: item.type,
            lowStockAlert: item.lowStockAlert || 0,
            imageUrl: item.imageUrl
          };
        });
        
        setInventory(inventoryMap);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        Alert.alert('Error', 'Failed to load inventory data');
      } finally {
        setInventoryLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const handleQuantityChange = (id, value) => {
    const numValue = parseInt(value) || 0;
    const maxAvailable = inventory[id]?.quantity || 0;
    
    // Ensure we don't approve more than available in inventory
    const validatedValue = Math.min(numValue, maxAvailable);
    
    setApprovedQuantities(prev => ({
      ...prev,
      [id]: validatedValue
    }));
  };

  const handleIncrement = (id) => {
    const currentValue = approvedQuantities[id] || 0;
    const maxAvailable = inventory[id]?.quantity || 0;
    
    if (currentValue < maxAvailable) {
      setApprovedQuantities(prev => ({
        ...prev,
        [id]: currentValue + 1
      }));
    } else {
      // Alert user if trying to exceed available inventory
      Alert.alert('Inventory Limit', `Cannot approve more than ${maxAvailable} units (current inventory)`);
    }
  };

  const handleDecrement = (id) => {
    const currentValue = approvedQuantities[id] || 0;
    if (currentValue > 0) {
      setApprovedQuantities(prev => ({
        ...prev,
        [id]: currentValue - 1
      }));
    }
  };

  const validateApproval = () => {
    // Check if any requested item exceeds available inventory
    for (const item of request.equipment) {
      const inventoryItem = inventory[item.equipmentId];
      if (!inventoryItem) {
        Alert.alert('Validation Error', `Item "${item.name}" not found in inventory`);
        return false;
      }
      
      const approvedQty = approvedQuantities[item.equipmentId] || 0;
      if (approvedQty > inventoryItem.quantity) {
        Alert.alert('Inventory Limit', 
          `Cannot approve ${approvedQty} units of "${item.name}" (only ${inventoryItem.quantity} available in inventory)`);
        return false;
      }
    }
    return true;
  };

  const handleApprove = async () => {
    if (!validateApproval()) return;
  
    try {
      setSubmitting(true);
      const requestRef = doc(db, 'Requests', requestId);
  
      const approvedEquipment = request.equipment
        .filter(item => approvedQuantities[item.equipmentId] > 0)
        .map(item => ({
          equipmentId: item.equipmentId,
          name: item.name,
          requestedQuantity: item.quantity,
          approvedQuantity: approvedQuantities[item.equipmentId] || 0,
        }));
  
      if (approvedEquipment.length === 0) {
        Alert.alert('Error', 'At least one item must be approved');
        setSubmitting(false);
        return;
      }
  
      // Create new document in 'approvedRequests'
      await addDoc(approvedRef, {
        requestId,
        labId: request.labId,
        approvedBy: user.uid, // Replace with actual user ID
        approvedAt: new Date().toISOString(),
        equipment: approvedEquipment,
        status: approvedEquipment.length === request.equipment.length ? 'approved' : 'partially approved',
      });
  
      // Update inventory
      for (const item of approvedEquipment) {
        const inventoryItem = inventory[item.equipmentId];
        const newQuantity = Math.max(inventoryItem.quantity - item.approvedQuantity, 0);
  
        const itemRef = doc(componentsRef, item.equipmentId);
        await updateDoc(itemRef, {
          quantity: newQuantity,
          lastUpdated: new Date().toISOString(),
        });
      }
  
      // Update request status
      await updateDoc(requestRef, {
        status: approvedEquipment.length === request.equipment.length ? 'approved' : 'partially approved',
        approvedAt: new Date().toISOString(),
      });
  
      Alert.alert('Success', 'Request approved successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error approving request:', error);
      Alert.alert('Error', 'Failed to approve request');
    } finally {
      setSubmitting(false);
    }
  };
  
  const RequestApprovalScreen = ({ route }) => {
    const { requestId } = route.params;
    const [request, setRequest] = useState(null);
    const [inventory, setInventory] = useState({});
    const [approvedQuantities, setApprovedQuantities] = useState({});
    
    useEffect(() => {
      fetchRequestDetails();
      fetchInventory();
    }, []);
  
    const fetchRequestDetails = async () => { /* Fetch request logic */ };
    const fetchInventory = async () => { /* Fetch inventory logic */ };
  
    const handleQuantityChange = (equipmentId, value) => { /* Handle input changes */ };
    const handleIncrement = (equipmentId) => { /* Increment function */ };
    const handleDecrement = (equipmentId) => { /* Decrement function */ };
    const handleApprove = async () => { /* Approval logic */ };
  
    return (
      <View className="p-4 bg-gray-100 min-h-screen">
        <Text className="text-2xl font-bold mb-4">Approve Request</Text>
        
        {request ? (
          <>
            {request.equipment.map((item, index) => (
              <View key={index} className="bg-white p-4 rounded-lg shadow-sm my-2">
                <Text className="text-lg font-semibold">{item.name}</Text>
                <Text className="text-gray-600">Requested: {item.quantity}</Text>
                <Text className="text-gray-600">Available: {inventory[item.equipmentId]?.quantity || 0}</Text>
  
                <View className="flex-row items-center mt-2">
                  <TouchableOpacity 
                    onPress={() => handleDecrement(item.equipmentId)} 
                    className="p-2 bg-gray-200 rounded-full"
                  >
                    <AntDesign name="minus" size={20} color="black" />
                  </TouchableOpacity>
  
                  <TextInput
                    className="mx-2 text-center border border-gray-300 px-2 py-1 rounded-md w-16"
                    keyboardType="numeric"
                    value={approvedQuantities[item.equipmentId]?.toString() || '0'}
                    onChangeText={(value) => handleQuantityChange(item.equipmentId, value)}
                  />
  
                  <TouchableOpacity 
                    onPress={() => handleIncrement(item.equipmentId)} 
                    className="p-2 bg-gray-200 rounded-full"
                  >
                    <AntDesign name="plus" size={20} color="black" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity 
              onPress={handleApprove} 
              className="bg-blue-500 p-3 mt-4 rounded-lg"
            >
              <Text className="text-white text-center font-semibold">Approve Request</Text>
            </TouchableOpacity>
          </>
        ) : (
          <ActivityIndicator size="large" color="#000" />
        )}
      </View>
    );
  };
    

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }
    
    try {
      setSubmitting(true);
      const requestRef = doc(db, 'requests', requestId);
      
      await updateDoc(requestRef, {
        status: 'rejected',
        rejectionReason,
        rejectedBy: user.uid, // Replace with actual user ID
        rejectedAt: new Date().toISOString(),
      });
      
      Alert.alert('Request Rejected', 'The request has been rejected', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error rejecting request:', error);
      Alert.alert('Error', 'Failed to reject request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || inventoryLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-gray-600">Loading request details...</Text>
      </View>
    );
  }

  // Helper function to check if an item has insufficient inventory
  const hasInsufficientInventory = (itemId, requestedQty) => {
    const availableQty = inventory[itemId]?.quantity || 0;
    return requestedQty > availableQty;
  };

  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView className="flex-1">
        {/* Request Info */}
        <View className="bg-white m-4 rounded-xl overflow-hidden shadow-sm">
          <View className="bg-indigo-50 p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-800">
              Request #{request.id.slice(0, 6)}
            </Text>
            <View className="flex-row justify-between items-center mt-2">
              <Text className="text-gray-600">Status:</Text>
              <View className={`px-3 py-1 rounded-full ${
                request.status === 'approved' ? 'bg-green-100' :
                request.status === 'pending' ? 'bg-amber-100' : 'bg-red-100'
              }`}>
                <Text className={`text-sm font-medium ${
                  request.status === 'approved' ? 'text-green-600' :
                  request.status === 'pending' ? 'text-amber-500' : 'text-red-500'
                }`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </Text>
              </View>
            </View>
            <View className="mt-2">
              <Text className="text-gray-600">Lab ID: {request.labId}</Text>
              <Text className="text-gray-600">Requested by: {request.username}</Text>
              <Text className="text-gray-600">
                Requested on: {new Date(request.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
          
          {/* Purpose Section */}
          <View className="p-4 border-b border-gray-200">
            <Text className="font-semibold text-gray-700 mb-2">Purpose</Text>
            <Text className="text-gray-600">{request.purpose || 'No purpose specified'}</Text>
          </View>
          
          {/* Items Section */}
          <View className="p-4">
            <Text className="font-semibold text-gray-700 mb-4">Requested Items</Text>
            
            {request.equipment.map((item, idx) => {
              const inventoryItem = inventory[item.equipmentId];
              const isInsufficientStock = hasInsufficientInventory(item.equipmentId, item.quantity);
              
              return (
                <View key={`${item.equipmentId}-${idx}`} className="mb-4 last:mb-0">
                  <View className="flex-row items-center mb-2">
                    {item.img && (
                      <Image source={{uri: item.img}} style={{width: 50, height: 50, borderRadius: 10}} />
                    )}
                    <View className="ml-3 flex-1">
                      <Text className="font-medium text-gray-800">{item.name}</Text>
                      <Text className="text-gray-500 text-xs">{item.type}</Text>
                    </View>
                  </View>
                  
                  <View className="bg-gray-50 p-3 rounded-lg">
                    <View className="flex-row justify-between mb-3">
                      <Text className="text-gray-600">Requested quantity:</Text>
                      <Text className="font-medium">{item.quantity}</Text>
                    </View>
                    
                    <View className="flex-row justify-between mb-3">
                      <Text className="text-gray-600">Available in inventory:</Text>
                      <Text className={`font-medium ${isInsufficientStock ? 'text-red-500' : 'text-green-500'}`}>
                        {inventoryItem?.quantity || 0}
                      </Text>
                    </View>
                    
                    {isInsufficientStock && (
                      <View className="bg-red-50 p-2 rounded-md mb-3 flex-row items-center">
                        <MaterialIcons name="error-outline" size={16} color="#EF4444" />
                        <Text className="text-red-500 ml-2 text-sm">
                          Insufficient inventory for requested quantity
                        </Text>
                      </View>
                    )}
                    
                    {request.status === 'pending' && (
                      <View>
                        <Text className="text-gray-700 font-medium mb-2">Approve quantity:</Text>
                        <View className="flex-row items-center">
                          <TouchableOpacity
                            onPress={() => handleDecrement(item.equipmentId)}
                            className="bg-gray-200 rounded-full w-8 h-8 items-center justify-center"
                          >
                            <AntDesign name="minus" size={16} color="#4B5563" />
                          </TouchableOpacity>
                          
                          <TextInput
                            className="mx-3 px-3 py-1 border border-gray-300 rounded-md w-16 text-center"
                            keyboardType="number-pad"
                            value={String(approvedQuantities[item.equipmentId] || 0)}
                            onChangeText={(text) => handleQuantityChange(item.equipmentId, text)}
                          />
                          
                          <TouchableOpacity
                            onPress={() => handleIncrement(item.equipmentId)}
                            className="bg-gray-200 rounded-full w-8 h-8 items-center justify-center"
                          >
                            <AntDesign name="plus" size={16} color="#4B5563" />
                          </TouchableOpacity>
                          
                          <View className="ml-auto">
                            <Text className="text-xs text-gray-500">
                              Max: {inventoryItem?.quantity || 0}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                    
                    {request.status === 'approved' && (
                      <View className="flex-row justify-between">
                        <Text className="text-gray-600">Approved quantity:</Text>
                        <Text className="font-medium text-green-600">
                          {item.approvedQuantity || item.quantity}
                        </Text>
                      </View>
                    )}
                    
                    {request.status === 'rejected' && (
                      <View className="bg-red-50 p-2 rounded-md">
                        <Text className="text-red-500 text-sm">
                          This request was rejected
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
          
          {/* Rejection Reason (if rejected) */}
          {request.status === 'rejected' && request.rejectionReason && (
            <View className="p-4 border-t border-gray-200">
              <Text className="font-semibold text-gray-700 mb-2">Rejection Reason</Text>
              <Text className="text-gray-600">{request.rejectionReason}</Text>
            </View>
          )}
        </View>
        
        {/* Action Buttons for Pending Requests */}
        {request.status === 'pending' && (
          <View className="m-4 mb-8">
            <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
              <Text className="font-semibold text-gray-700 mb-2">Rejection Reason (optional)</Text>
              <TextInput
                className="border border-gray-300 rounded-md p-3 min-h-24 text-gray-700"
                placeholder="Provide a reason if you plan to reject this request..."
                multiline
                value={rejectionReason}
                onChangeText={setRejectionReason}
              />
            </View>
            
            <View className="flex-row justify-between gap-4">
              <TouchableOpacity
                className="flex-1 bg-red-500 p-4 rounded-xl flex-row justify-center items-center"
                onPress={handleReject}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Feather name="x" size={20} color="#FFFFFF" />
                    <Text className="text-white font-medium ml-2">Reject</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 bg-green-500 p-4 rounded-xl flex-row justify-center items-center"
                onPress={handleApprove}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Feather name="check" size={20} color="#FFFFFF" />
                    <Text className="text-white font-medium ml-2">Approve</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default RequestSummary;