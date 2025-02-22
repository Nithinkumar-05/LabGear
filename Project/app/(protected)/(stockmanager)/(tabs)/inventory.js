import { View, Text, TouchableOpacity, Image, ScrollView, TextInput, Alert } from 'react-native';
import { componentsRef } from '@/firebaseConfig';
import { getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { MaterialIcons, AntDesign, Feather } from '@expo/vector-icons';
import { useAuth } from '@/routes/AuthContext';

const InventoryItemCard = ({ item, onUpdate, onHistory }) => {
  const [quantity, setQuantity] = useState(item.quantity || 0);
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleDecrement = () => setQuantity(prev => (prev > 0 ? prev - 1 : 0));
  const handleIncrement = () => setQuantity(prev => prev + 1);

  const handleSave = () => {
    onUpdate({ ...item, quantity, notes });
    setIsEditing(false);
  };

  return (
    <View className="bg-white shadow-md rounded-lg p-4 mb-4">
      <View className="flex-row items-center">
        {item.imageUrl && (
          <Image
            source={{ uri: item.imageUrl }}
            className="w-16 h-16 rounded-lg mr-4"
            resizeMode="cover"
          />
        )}
        <View className="flex-1">
          <Text className="text-xl font-semibold text-gray-800">{item.name}</Text>
          <Text className="text-sm text-gray-500">Current stock: {item.quantity || 0}</Text>
          {!isEditing && (
            <View className="flex-row mt-2 items-center">
              <TouchableOpacity 
                className="bg-blue-100 py-1 px-3 rounded-lg mr-2"
                onPress={() => setIsEditing(true)}
              >
                <Text className="text-blue-700">Update</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-gray-100 py-1 px-3 rounded-lg"
                onPress={onHistory}
              >
                <Text className="text-gray-700">History</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      
      {isEditing && (
        <View className="mt-4 pt-4 border-t border-gray-200">
          <Text className="font-medium mb-2">Update Inventory</Text>
          <View className="flex-row items-center mb-3">
            <Text className="w-24">New Quantity:</Text>
            <View className="flex-row items-center flex-1">
              <TouchableOpacity
                onPress={handleDecrement}
                className="bg-gray-300 rounded-full w-8 h-8 items-center justify-center"
              >
                <AntDesign name="minus" size={16} color="#4B5563" />
              </TouchableOpacity>
              <Text className="mx-4 text-lg font-medium">{quantity}</Text>
              <TouchableOpacity
                onPress={handleIncrement}
                className="bg-gray-300 rounded-full w-8 h-8 items-center justify-center"
              >
                <AntDesign name="plus" size={16} color="#4B5563" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View className="mb-4">
            <Text className="mb-1">Notes:</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
              placeholder="Reason for update, condition, etc."
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>
          
          <View className="flex-row justify-end">
            <TouchableOpacity
              className="bg-gray-200 py-2 px-4 rounded-lg mr-2"
              onPress={() => setIsEditing(false)}
            >
              <Text className="text-gray-800">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-blue-500 py-2 px-4 rounded-lg"
              onPress={handleSave}
            >
              <Text className="text-white font-medium">Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const Inventory = () => {
  const [equipment, setEquipment] = useState({ consumable: [], nonConsumable: [] });
  const [filteredEquipment, setFilteredEquipment] = useState({ consumable: [], nonConsumable: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const {user} = useAuth();

  const fetchEquipment = async () => {
    setIsLoading(true);
    try {
      const equipmentSnap = await getDocs(componentsRef);
      const items = equipmentSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        history: doc.data().history || []
      }));

      const equipmentData = {
        consumable: items.filter(item => item.type === 'consumable'),
        nonConsumable: items.filter(item => item.type === 'non-consumable'),
      };

      setEquipment(equipmentData);
      setFilteredEquipment(equipmentData);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      Alert.alert('Error', 'Failed to load inventory data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredEquipment({
        consumable: equipment.consumable.filter(item => 
          item.name.toLowerCase().includes(query)
        ),
        nonConsumable: equipment.nonConsumable.filter(item => 
          item.name.toLowerCase().includes(query)
        ),
      });
    } else {
      setFilteredEquipment(equipment);
    }
  }, [searchQuery, equipment]);

  const handleUpdate = async (updatedItem) => {
    try {
      const itemRef = doc(componentsRef, updatedItem.id);
      const currentItemDoc = await getDoc(itemRef);
      const currentItem = currentItemDoc.data();
      
      const historyEntry = {
        date: new Date().toISOString(),
        previousQuantity: currentItem.quantity || 0,
        newQuantity: updatedItem.quantity,
        notes: updatedItem.notes || '',
        updatedBy: user.uid,
      };
      
      await updateDoc(itemRef, {
        quantity: updatedItem.quantity,
        lastUpdated: new Date().toISOString(),
        history: [...(currentItem.history || []), historyEntry]
      });
      
      Alert.alert('Success', `${updatedItem.name} inventory updated successfully`);
      
      fetchEquipment();
    } catch (error) {
      console.error('Error updating inventory:', error);
      Alert.alert('Error', 'Failed to update inventory');
    }
  };

  const handleViewHistory = (item) => {
    Alert.alert(
      `${item.name} - History`,
      item.history && item.history.length > 0
        ? item.history
            .slice(-5) 
            .map(entry => 
              `${new Date(entry.date).toLocaleDateString()}: ${entry.previousQuantity} → ${entry.newQuantity}\n${entry.notes ? `Note: ${entry.notes}` : ''}`
            )
            .join('\n\n')
        : 'No history available',
      [{ text: 'Close' }]
    );
  };

  const getFilteredItems = () => {
    if (activeTab === 'all') {
      return [...filteredEquipment.nonConsumable, ...filteredEquipment.consumable];
    } else if (activeTab === 'non-consumable') {
      return filteredEquipment.nonConsumable;
    } else {
      return filteredEquipment.consumable;
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="mt-4 px-2 pb-6">
        <View className="flex-row items-center justify-center mb-6">
          <MaterialIcons name="inventory" size={28} color="#3B82F6" />
          <Text className="text-3xl font-bold text-center ml-2">Inventory</Text>
        </View>
        
        {/* Search Bar */}
        <View className="bg-white rounded-lg flex-row items-center px-3 mb-4 border border-gray-300">
          <Feather name="search" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 py-3 px-2"
            placeholder="Search inventory items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Filter Tabs */}
        <View className="flex-row mb-4 bg-white rounded-lg overflow-hidden">
          <TouchableOpacity 
            className={`flex-1 py-3 ${activeTab === 'all' ? 'bg-blue-500' : 'bg-white'}`}
            onPress={() => setActiveTab('all')}
          >
            <Text className={`text-center font-medium ${activeTab === 'all' ? 'text-white' : 'text-gray-800'}`}>
              All Items
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 py-3 ${activeTab === 'non-consumable' ? 'bg-blue-500' : 'bg-white'}`}
            onPress={() => setActiveTab('non-consumable')}
          >
            <Text className={`text-center font-medium ${activeTab === 'non-consumable' ? 'text-white' : 'text-gray-800'} ml-1`}>
              Non-Consumable
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 py-3 ${activeTab === 'consumable' ? 'bg-blue-500' : 'bg-white'}`}
            onPress={() => setActiveTab('consumable')}
          >
            <Text className={`text-center font-medium ${activeTab === 'consumable' ? 'text-white' : 'text-gray-800'}`}>
              Consumable
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Inventory List */}
        {isLoading ? (
          <View className="items-center py-8">
            <AntDesign name="loading1" size={24} color="#3B82F6" />
            <Text className="text-center mt-2 text-gray-600">Loading inventory data...</Text>
          </View>
        ) : getFilteredItems().length > 0 ? (
          getFilteredItems().map(item => (
            <InventoryItemCard 
              key={item.id} 
              item={item} 
              onUpdate={handleUpdate}
              onHistory={() => handleViewHistory(item)}
            />
          ))
        ) : (
          <View className="bg-white p-8 rounded-lg items-center">
            <Feather name="box" size={48} color="#9CA3AF" />
            <Text className="text-gray-600 text-lg mt-4 mb-2">No items found</Text>
            <Text className="text-gray-500 text-center">
              {searchQuery ? 'Try adjusting your search terms' : 'There are no items in this category'}
            </Text>
          </View>
        )}
        
        {/* Refresh Button */}
        <TouchableOpacity
          className="bg-blue-500 py-3 px-4 rounded-lg mt-4 flex-row items-center justify-center"
          onPress={fetchEquipment}
        >
          <Feather name="refresh-cw" size={18} color="white" />
          <Text className="text-white font-medium text-center ml-2">Refresh Inventory</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Inventory;