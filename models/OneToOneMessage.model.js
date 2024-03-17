import mongoose from "mongoose";

const oneToOneMessageSchema = mongoose.Schema({

});

const OneToOneMessage = mongoose.model("OneToOneMessage", oneToOneMessageSchema);

export default OneToOneMessage;