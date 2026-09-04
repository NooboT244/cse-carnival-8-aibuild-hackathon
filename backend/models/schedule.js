import mongoose from "mongoose";

const schedulesSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },

    course: {
        type: String,
        required: true,
    },

    title: {
        type: String,
        required: true,
    },

    day: {
        type: String,
        required: true,
        enum: [
            "Saturday",
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday"
        ],
    },

    start_time: {
        type: String,
        required: true,
    },

    end_time: {
        type: String,
        required: true,
    },

    room: {
        type: String,
        required: true,
    },

    instructor: {
        type: String,
        required: true,
    },

    section: {
        type: String,
        required: true,
    }
});

export default mongoose.model("Schedules", schedulesSchema);