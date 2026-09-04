import express from "express";
import Event from "../models/event.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const events = await Event.find();

        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get events",
            error: error.message
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const event = await Event.findOne({
            id: req.params.id
        });

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get event",
            error: error.message
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const event = await Event.create(req.body);

        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({
            message: "Failed to create event",
            error: error.message
        });
    }
});

router.patch("/:id", async (req, res) => {
    try {
        const event = await Event.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { returnDocument: "after", runValidators: true }
        );

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.status(200).json(event);
    } catch (error) {
        res.status(400).json({
            message: "Failed to update event",
            error: error.message
        });
    }
});

export default router;