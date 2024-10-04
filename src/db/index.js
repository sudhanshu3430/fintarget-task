// Define a Mongoose schema and model
const mongoose = require('mongoose');
const connectToReplicaSets = async () => {
    const uri = 'YOUR_MONGODB_URL';
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      readPreference: 'primaryPreferred', // Use primaryPreferred read preference
    };
  
    try {
      await mongoose.connect(uri, options);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
    }
  };
  
  // Call this function on server startup
  connectToReplicaSets();
const taskSchema = new mongoose.Schema({
    user_id: String,
    completedAt: Date,
  });
  
   const Task = mongoose.model('Task', taskSchema);
   module.exports = {
    Task}