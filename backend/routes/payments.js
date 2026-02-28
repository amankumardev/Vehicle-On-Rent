const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/payments/create-intent
// @desc    Create Stripe payment intent
// @access  Private
router.post('/create-intent', protect, async (req, res) => {
    try {
        const { bookingId } = req.body;

        // Get booking details
        const booking = await Booking.findById(bookingId).populate('vehicle');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Verify user owns this booking
        if (booking.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to pay for this booking'
            });
        }

        // Check if payment already made
        if (booking.paymentStatus === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Payment already completed for this booking'
            });
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(booking.totalPrice * 100), // Convert to cents
            currency: 'usd', // Change to your preferred currency
            metadata: {
                bookingId: booking._id.toString(),
                userId: req.user.id,
                vehicleName: booking.vehicle.name
            },
            description: `Booking for ${booking.vehicle.name} (${booking.totalDays} days)`
        });

        // Save payment intent ID to booking
        booking.paymentIntentId = paymentIntent.id;
        await booking.save();

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating payment intent',
            error: error.message
        });
    }
});

// @route   POST /api/payments/confirm
// @desc    Confirm payment and update booking
// @access  Private
router.post('/confirm', protect, async (req, res) => {
    try {
        const { paymentIntentId, bookingId } = req.body;

        // Retrieve payment intent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({
                success: false,
                message: 'Payment not completed'
            });
        }

        // Update booking
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Verify user owns this booking
        if (booking.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to confirm payment for this booking'
            });
        }

        // Update booking status
        booking.paymentStatus = 'paid';
        booking.status = 'confirmed';
        await booking.save();

        await booking.populate('vehicle');

        res.status(200).json({
            success: true,
            message: 'Payment confirmed successfully',
            booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error confirming payment',
            error: error.message
        });
    }
});

// @route   GET /api/payments/:bookingId
// @desc    Get payment details for a booking
// @access  Private
router.get('/:bookingId', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Verify user owns this booking or is admin
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view payment details'
            });
        }

        let paymentDetails = null;
        if (booking.paymentIntentId) {
            paymentDetails = await stripe.paymentIntents.retrieve(booking.paymentIntentId);
        }

        res.status(200).json({
            success: true,
            paymentStatus: booking.paymentStatus,
            paymentDetails
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching payment details',
            error: error.message
        });
    }
});

// @route   POST /api/payments/webhook
// @desc    Stripe webhook for payment events
// @access  Public (Stripe)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            // Update booking status
            const booking = await Booking.findOne({ paymentIntentId: paymentIntent.id });
            if (booking) {
                booking.paymentStatus = 'paid';
                booking.status = 'confirmed';
                await booking.save();
            }
            break;
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            const failedBooking = await Booking.findOne({ paymentIntentId: failedPayment.id });
            if (failedBooking) {
                failedBooking.paymentStatus = 'failed';
                await failedBooking.save();
            }
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

module.exports = router;
