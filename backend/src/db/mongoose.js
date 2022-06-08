import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connection_URL =
  "mongodb+srv://admin:t040O95C3710VSE4@cluster0.o8wwc.mongodb.net/interview-users2";

//function for checking database connection
const connectToMongo = async () => {
  try {
    await mongoose.connect(connection_URL, {
      useNewUrlParser: true,
      autoIndex: true,
      useUnifiedTopology: true,
    });
    console.log("connected to mongo successfully");
  } catch (error) {
    console.log(error);
  }
};

export default connectToMongo;

//t040O95C3710VSE4