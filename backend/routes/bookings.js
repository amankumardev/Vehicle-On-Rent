const express = require('express');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { vehicle, startDate, endDate, pickupLocation, dropoffLocation, notes } = req.body;

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end <= start) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }

        if (start < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Start date cannot be in the past'
            });
        }

        // Check if vehicle exists
        const vehicleData = await Vehicle.findById(vehicle);
        if (!vehicleData) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // Check if vehicle is available for the dates
        const overlappingBookings = await Booking.find({
            vehicle,
            status: { $in: ['pending', 'confirmed'] },
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } }
            ]
        });

        if (overlappingBookings.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle is not available for the selected dates'
            });
        }

        // Calculate total price
        const diffTime = Math.abs(end - start);
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const totalPrice = totalDays * vehicleData.pricePerDay;

        // Create booking
        const booking = await Booking.create({
            user: req.user.id,
            vehicle,
            startDate: start,
            endDate: end,
            totalDays,
            totalPrice,
            pickupLocation,
            dropoffLocation,
            notes
        });

        // Populate vehicle and user details
        await booking.populate('vehicle');
        await booking.populate('user', 'name email phone');

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking
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
            message: 'Error creating booking',
            error: error.message
        });
    }
});

// @route   GET /api/bookings/user
// @desc    Get current user's bookings
// @access  Private
router.get('/user', protect, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('vehicle')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('vehicle')
            .populate('user', 'name email phone');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user owns this booking or is admin
        if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this booking'
            });
        }

        res.status(200).json({
            success: true,
            booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching booking',
            error: error.message
        });
    }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user owns this booking
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking'
            });
        }

        // Check if booking can be cancelled
        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Booking is already cancelled'
            });
        }

        if (booking.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel a completed booking'
            });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error cancelling booking',
            error: error.message
        });
    }
});

// @route   GET /api/bookings
// @desc    Get all bookings (admin only)
// @access  Private/Admin
router.get('/', protect, restrictTo('admin'), async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('vehicle')
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status (admin only)
// @access  Private/Admin
router.put('/:id/status', protect, restrictTo('admin'), async (req, res) => {
    try {
        const { status } = req.body;

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Booking status updated successfully',
            booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating booking status',
            error: error.message
        });
    }
});

module.exports = router;
