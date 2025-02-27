import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import BudgetChart from '@/components/BudgetChart'; // Import the BudgetChart component

const Budget = () => {
    return (
        <SafeAreaView className='flex-1 bg-gray-100'>
            
            <BudgetChart />
        </SafeAreaView>
    );
}
 
export default Budget;