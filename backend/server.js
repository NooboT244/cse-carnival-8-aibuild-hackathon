import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import scheduleRoutes from "./routes/scheduleRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/schedules", scheduleRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/announcements", announcementRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.log("MongoDB connection failed:", error);
    });

app.get('/', (req, res) => {
    res.status(200).send({
        message: "CampusOS API is running"
    })
})

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});