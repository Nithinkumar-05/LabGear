import {usersRef} from '@/firebaseConfig';
import { collection, query, getDocs } from 'firebase/firestore';
import { useState, useEffect, useCallback } from 'react';
const UsersData = () => {
    const [users,setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    const getUsers = async () =>{
        try {
            setLoading(true);
            const userSnap =await getDocs(query(usersRef));
            const usersData = userSnap.docs.map(doc=>({
                id:doc.id,
                ...doc.data()
            }));
            setUsers(usersData);
        } catch (error) {
            const errorMessage = 'Failed to fetch user details';
            setError(errorMessage);
            Alert.alert('Error', errorMessage);
        }finally{
            setLoading(false);
        }
    }

    useEffect(()=>{
        getUsers();
    },[getUsers]);

    const refreshUser = () =>{
       return getUsers();
    }
    return ( {
        loading,
        users,
        error,
        refreshUser
    } );
}
 
export default UsersData;