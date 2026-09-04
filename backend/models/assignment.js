import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    course: {
        type: String,
        required: true
    },
    course_title: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    assigned_date: {
        type: String,
        required: true
    },
    deadline: {
        type: String,
        required: true
    },
    submission_platform: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
    },
    marks: {
        type: Number,
        required: true,
        min: 0
    }
});

export default mongoose.model("Assignment", assignmentSchema);