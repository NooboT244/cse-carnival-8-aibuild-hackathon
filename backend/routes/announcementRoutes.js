import express from "express";
import Announcement from "../models/announcement.js";

const router = express.Router();


router.get("/", async (req, res) => {
    try {
        const announcements = await Announcement.find();

        res.status(200).json(announcements);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get announcements",
            error: error.message
        });
    }
});


router.get("/:id", async (req, res) => {
    try {
        const announcement = await Announcement.findOne({
            id: req.params.id
        });

        if (!announcement) {
            return res.status(404).json({
                message: "Announcement not found"
            });
        }

        res.status(200).json(announcement);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get announcement",
            error: error.message
        });
    }
});


router.post("/", async (req, res) => {
    try {
        const announcement = await Announcement.create(req.body);

        res.status(201).json(announcement);
    } catch (error) {
        res.status(400).json({
            message: "Failed to create announcement",
            error: error.message
        });
    }
});


router.patch("/:id", async (req, res) => {
    try {
        const announcement = await Announcement.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { returnDocument: "after", runValidators: true }
        );

        if (!announcement) {
            return res.status(404).json({
                message: "Announcement not found"
            });
        }

        res.status(200).json(announcement);
    } catch (error) {
        res.status(400).json({
            message: "Failed to update announcement",
            error: error.message
        });
    }
});

export default router;