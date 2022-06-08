import mongoose from "mongoose";
//calling Schema instance from mongoose using destructing
const { Schema } = mongoose;

const imageSchema = new Schema(
  {
    userId: {
      type: String,
      require: true,
      unique: true,
    },
    name: {
      type: String,
      require: true,
      min: 3,
      max: 20,
      unique: true,
    },

    image: {
      data: Buffer,
      contentType: String,
    },
  },
  { timestamps: true }
);

const Image = mongoose.model("Image", imageSchema);
//user.createIndexes();

export default Image;
