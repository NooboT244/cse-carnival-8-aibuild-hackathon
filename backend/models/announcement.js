import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        required: true,
    },
    posted_by: {
        type: String,
        required: true
    },
    expires: {
        type: String,
        required: true
    }
});

export default mongoose.model("Announcement", announcementSchema);