import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";

import Schedule from "./models/schedule.js";
import Room from "./models/room.js";
import Event from "./models/event.js";
import Assignment from "./models/assignment.js";
import Announcement from "./models/announcement.js";

dotenv.config();

// Read JSON files
const schedules = JSON.parse(
    fs.readFileSync("../data/schedules.json", "utf-8")
);

const rooms = JSON.parse(
    fs.readFileSync("../data/rooms.json", "utf-8")
);

const events = JSON.parse(
    fs.readFileSync("../data/events.json", "utf-8")
);

const assignments = JSON.parse(
    fs.readFileSync("../data/assignments.json", "utf-8")
);

const announcements = JSON.parse(
    fs.readFileSync("../data/announcements.json", "utf-8")
);


const seedDatabase = async () => {
    try {

        // Connect MongoDB
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");


        // Schedules
        await Promise.all(
            schedules.map(schedule =>
                Schedule.updateOne(
                    { id: schedule.id },
                    { $set: schedule },
                    { upsert: true }
                )
            )
        );

        console.log("Schedules seeded");


        // Rooms
        await Promise.all(
            rooms.map(room =>
                Room.updateOne(
                    { id: room.id },
                    { $set: room },
                    { upsert: true }
                )
            )
        );

        console.log("Rooms seeded");


        // Events
        await Promise.all(
            events.map(event =>
                Event.updateOne(
                    { id: event.id },
                    { $set: event },
                    { upsert: true }
                )
            )
        );

        console.log("Events seeded");


        // Assignments
        await Promise.all(
            assignments.map(assignment =>
                Assignment.updateOne(
                    { id: assignment.id },
                    { $set: assignment },
                    { upsert: true }
                )
            )
        );

        console.log("Assignments seeded");


        // Announcements
        await Promise.all(
            announcements.map(announcement =>
                Announcement.updateOne(
                    { id: announcement.id },
                    { $set: announcement },
                    { upsert: true }
                )
            )
        );

        console.log("Announcements seeded");


        console.log("Database seeding completed successfully");


        // Disconnect
        await mongoose.disconnect();

    } catch (error) {

        console.log("Database seeding failed:", error);

        await mongoose.disconnect();

    }
};


seedDatabase();
