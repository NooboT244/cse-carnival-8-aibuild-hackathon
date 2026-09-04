import express from "express";
import Room from "../models/room.js";

const router = express.Router();


router.get("/", async (req, res) => {
    try {
        const rooms = await Room.find();

        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get rooms",
            error: error.message
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const room = await Room.findOne({
            id: req.params.id
        });

        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        res.status(200).json(room);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get room",
            error: error.message
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const room = await Room.create(req.body);

        res.status(201).json(room);
    } catch (error) {
        res.status(400).json({
            message: "Failed to create room",
            error: error.message
        });
    }
});

router.patch("/:id", async (req, res) => {
    try {
        const room = await Room.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { returnDocument: "after", runValidators: true }
        );

        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        res.status(200).json(room);
    } catch (error) {
        res.status(400).json({
            message: "Failed to update room",
            error: error.message
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const room = await Room.findOneAndDelete({
            id: req.params.id
        });

        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        res.status(200).json({
            message: "Room deleted successfully",
            room
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete room",
            error: error.message
        });
    }
});

export default router;