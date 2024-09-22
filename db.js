const mongoose = require("mongoose");
const colors = require("colors");
require("dotenv").config();
const dbConnect = async () => {
  try { 
    console.log(process.env.MONGODB_URI);  
    const connectionString = await mongoose.connect(process.env.MONGODB_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log(
      colors.yellow(`DB connected: ${connectionString.connection.host}\n`)
    );
  } catch (error) {  
    console.log(error);
    console.log(colors.red("Connection to link DB failed\n"));
  }
};

module.exports = dbConnect;
