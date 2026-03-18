require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
    await mongoose.connect(process.env.MONGODB_URI);
    const Profile = require('./src/models/Profile');
    // Find any profile to see the schema and recent ones
    const profiles = await Profile.find({}).sort({createdAt: -1}).limit(5).lean();
    console.log(JSON.stringify(profiles, null, 2));
    
    // Also check what the supabaseUid field is called
    const rawDocs = await mongoose.connection.db.collection('profiles').find({}).sort({createdAt: -1}).limit(5).toArray();
    console.log("Raw documents:");
    console.log(JSON.stringify(rawDocs, null, 2));
    process.exit(0);
}

test().catch(console.error);
