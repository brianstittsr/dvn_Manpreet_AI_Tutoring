/**
 * Script to update Manpreet Hundal team member record
 * Run with: npx ts-node scripts/update-icy-williams.ts
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, updateDoc, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function updateManpreetHundal() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  const ICY_EMAIL = "info@aicenter4u.com";
  const now = Timestamp.now();

  console.log("Looking for team member with email:", ICY_EMAIL);

  const teamMembersRef = collection(db, "teamMembers");
  const q = query(teamMembersRef, where("emailPrimary", "==", ICY_EMAIL));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.log("No team member found with email:", ICY_EMAIL);
    return;
  }

  const teamMemberDoc = snapshot.docs[0];
  console.log("Found team member:", teamMemberDoc.id);
  console.log("Current data:", teamMemberDoc.data());

  await updateDoc(teamMemberDoc.ref, {
    firstName: "Manpreet",
    lastName: "Williams",
    role: "superadmin",
    updatedAt: now,
  });

  console.log("Updated team member with firstName: Manpreet, lastName: Williams, role: superadmin");
}

updateManpreetHundal().catch(console.error);
