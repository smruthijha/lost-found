import admin from "firebase-admin";

// Initialize Firebase Admin using the environment variable
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

async function seedAdmin() {
  try {
    const uid = "If9wM4iduoXvKp1WM4meBofzMp53"; // your user UID

    await db.collection("users").doc(uid).set(
      { role: "admin" },
      { merge: true } // preserves existing fields
    );

    console.log("✅ Admin role granted to UID:", uid);
  } catch (error) {
    console.error("❌ Error seeding admin:", error.message);
  }
}

seedAdmin();