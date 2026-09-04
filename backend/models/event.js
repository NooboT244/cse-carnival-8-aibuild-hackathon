import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
    {
        student_id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        }
    },
    { _id: false }
);

const eventSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    start_time: {
        type: String,
        required: true
    },
    end_time: {
        type: String,
        required: true
    },
    end_date: {
        type: String,
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    organizer: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    registered: {
        type: Number,
        required: true,
        min: 0
    },
    registrations: {
        type: [registrationSchema],
        default: []
    },
    status: {
        type: String,
        required: true,
    }
});

export default mongoose.model("Event", eventSchema);