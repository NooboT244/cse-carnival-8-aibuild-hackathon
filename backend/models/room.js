import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },

    room_number: {
        type: String,
        required: true,
        unique: true
    },

    type: {
        type: String,
        required: true
    },

    capacity: {
        type: Number,
        required: true,
        min: 1
    },

    equipment: {
        type: [String],
        default: []
    },

    floor: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        required: true,
        enum: ["available", "occupied", "maintenance"]
    },

    bookings: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
    }
});

export default mongoose.model("Room", roomSchema);