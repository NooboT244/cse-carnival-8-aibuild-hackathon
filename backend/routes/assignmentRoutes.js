import express from "express";
import Assignment from "../models/assignment.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const assignments = await Assignment.find();

        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get assignments",
            error: error.message
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const assignment = await Assignment.findOne({
            id: req.params.id
        });

        if (!assignment) {
            return res.status(404).json({
                message: "Assignment not found"
            });
        }

        res.status(200).json(assignment);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get assignment",
            error: error.message
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const assignment = await Assignment.create(req.body);

        res.status(201).json(assignment);
    } catch (error) {
        res.status(400).json({
            message: "Failed to create assignment",
            error: error.message
        });
    }
});

router.patch("/:id", async (req, res) => {
    try {
        const assignment = await Assignment.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { returnDocument: "after", runValidators: true }
        );

        if (!assignment) {
            return res.status(404).json({
                message: "Assignment not found"
            });
        }

        res.status(200).json(assignment);
    } catch (error) {
        res.status(400).json({
            message: "Failed to update assignment",
            error: error.message
        });
    }
});

export default router;