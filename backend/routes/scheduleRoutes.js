import express from "express";
import Schedule from "../models/schedule.js";

const router = express.Router();


router.get("/", async (req, res) => {
    try {
        const schedules = await Schedule.find();

        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get schedules",
            error: error.message
        });
    }
});


router.get("/:id", async (req, res) => {
    try {
        const schedule = await Schedule.findOne({
            id: req.params.id
        });

        if (!schedule) {
            return res.status(404).json({
                message: "Schedule not found"
            });
        }

        res.status(200).json(schedule);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get schedule",
            error: error.message
        });
    }
});


router.post("/", async (req, res) => {
    try {
        const schedule = await Schedule.create(req.body);

        res.status(201).json(schedule);
    } catch (error) {
        res.status(400).json({
            message: "Failed to create schedule",
            error: error.message
        });
    }
});


router.patch("/:id", async (req, res) => {
    try {
        const schedule = await Schedule.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { returnDocument: "after", runValidators: true }
        );

        if (!schedule) {
            return res.status(404).json({
                message: "Schedule not found"
            });
        }

        res.status(200).json(schedule);
    } catch (error) {
        res.status(400).json({
            message: "Failed to update schedule",
            error: error.message
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const schedule = await Schedule.findOneAndDelete({
            id: req.params.id
        });

        if (!schedule) {
            return res.status(404).json({
                message: "Schedule not found"
            });
        }

        res.status(200).json({
            message: "Schedule deleted successfully",
            schedule
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete schedule",
            error: error.message
        });
    }
});

export default router;