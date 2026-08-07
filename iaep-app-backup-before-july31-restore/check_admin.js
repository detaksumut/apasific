require('dotenv').config({ path: '.env.local' });
const { getFirebaseAdmin } = require('./src/utils/firebase/server');
const { getFirestore } = require('./src/utils/firebase/db');

async function checkAdmins() {
    try {
        const admin = getFirebaseAdmin();
        const db = getFirestore();
        
        console.log("Checking Firestore 'profiles' collection for admins/co-admins...");
        const profilesSnapshot = await db.collection('profiles').where('role', 'in', ['admin', 'co-admin', 'super-admin']).get();
        
        if (profilesSnapshot.empty) {
            console.log("No users found with role 'admin' or 'co-admin' in Firestore 'profiles' collection.");
        } else {
            profilesSnapshot.forEach(doc => {
                console.log(`Found in Firestore: ${doc.id} =>`, doc.data());
            });
        }
        
        console.log("\nChecking Firebase Auth custom claims (if any)...");
        // Firebase Auth doesn't have an easy way to query by role unless we iterate all users
        let nextPageToken;
        let adminUsers = [];
        do {
            const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
            listUsersResult.users.forEach((userRecord) => {
                const claims = userRecord.customClaims || {};
                if (claims.admin || claims.role === 'admin' || claims.role === 'co-admin') {
                    adminUsers.push(userRecord);
                }
            });
            nextPageToken = listUsersResult.pageToken;
        } while (nextPageToken);
        
        if (adminUsers.length === 0) {
            console.log("No custom claims found for admins in Firebase Auth.");
        } else {
            adminUsers.forEach(u => console.log(`Found Admin in Firebase Auth: ${u.email} (Claims: ${JSON.stringify(u.customClaims)})`));
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

checkAdmins();
