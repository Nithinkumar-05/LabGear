import { getDoc, getDocs, collection, doc, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Ensure this is your Firestore instance

export default async function fetchData(userId) {
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error("User not found");
        }

        const userData = userSnap.data();
        // console.log(userData)
        // Step 2: Extract lab ID from the lab reference path
        if (!userData.labDetails || !userData.labDetails.labRef) {
            throw new Error("Lab reference not found in user data");
        }
        const labId = userData.labDetails.labId

        // Step 3: Fetch lab data using labId
        const labRef = doc(db, "labs", labId);
        const labSnap = await getDoc(labRef);

        if (!labSnap.exists()) {
            throw new Error("Lab not found");
        }

        const labData = labSnap.data();
        // console.log(labData)
        // Step 4: Fetch requests related to this lab
        const requestsQuery = query(collection(db, "Requests"), where("labId", "==", labId));
        const requestsSnap = await getDocs(requestsQuery);
        const requests = requestsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(labData);
        return { user: { id: userSnap.id, ...userData }, lab: { id: labSnap.id, ...labData }, requests };
    } catch (error) {
        console.error("Error fetching data:", error);
        return { user: null, lab: null, requests: [] };
    }
};

