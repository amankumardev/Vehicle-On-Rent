const express = require('express');
const Vehicle = require('../models/Vehicle');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/vehicles
// @desc    Get all vehicles with filtering
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { type, minPrice, maxPrice, transmission, fuelType, seats, search, city, available } = req.query;

        // Build query
        let query = {};

        if (type) query.type = type;
        if (transmission) query['specifications.transmission'] = transmission;
        if (fuelType) query['specifications.fuelType'] = fuelType;
        if (seats) query['specifications.seats'] = parseInt(seats);
        if (city) query['location.city'] = new RegExp(city, 'i');
        if (available !== undefined) query.availability = available === 'true';

        // Price range filter
        if (minPrice || maxPrice) {
            query.pricePerDay = {};
            if (minPrice) query.pricePerDay.$gte = parseFloat(minPrice);
            if (maxPrice) query.pricePerDay.$lte = parseFloat(maxPrice);
        }

        // Text search
        if (search) {
            query.$text = { $search: search };
        }

        // Execute query
        const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: vehicles.length,
            vehicles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching vehicles',
            error: error.message
        });
    }
});

// @route   GET /api/vehicles/:id
// @desc    Get single vehicle
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.status(200).json({
            success: true,
            vehicle
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching vehicle',
            error: error.message
        });
    }
});

// @route   POST /api/vehicles
// @desc    Create new vehicle
// @access  Private/Admin
router.post('/', protect, restrictTo('admin'), async (req, res) => {
    try {
        const vehicle = await Vehicle.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Vehicle created successfully',
            vehicle
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating vehicle',
            error: error.message
        });
    }
});

// @route   PUT /api/vehicles/:id
// @desc    Update vehicle
// @access  Private/Admin
router.put('/:id', protect, restrictTo('admin'), async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Vehicle updated successfully',
            vehicle
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating vehicle',
            error: error.message
        });
    }
});

// @route   DELETE /api/vehicles/:id
// @desc    Delete vehicle
// @access  Private/Admin
router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Vehicle deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting vehicle',
            error: error.message
        });
    }
});

// @route   GET /api/vehicles/:id/check-availability
// @desc    Check vehicle availability for dates
// @access  Public
router.post('/:id/check-availability', async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        const Booking = require('../models/Booking');

        // Find overlapping bookings
        const overlappingBookings = await Booking.find({
            vehicle: req.params.id,
            status: { $in: ['pending', 'confirmed'] },
            $or: [
                { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
            ]
        });

        const isAvailable = overlappingBookings.length === 0;

        res.status(200).json({
            success: true,
            available: isAvailable,
            message: isAvailable ? 'Vehicle is available' : 'Vehicle is not available for selected dates'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking availability',
            error: error.message
        });
    }
});

module.exports = router;
