const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Booking must belong to a user']
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: [true, 'Booking must have a vehicle']
    },
    startDate: {
        type: Date,
        required: [true, 'Please provide start date']
    },
    endDate: {
        type: Date,
        required: [true, 'Please provide end date']
    },
    totalDays: {
        type: Number,
        required: true,
        min: 1
    },
    totalPrice: {
        type: Number,
        required: [true, 'Please provide total price'],
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded', 'failed'],
        default: 'pending'
    },
    paymentIntentId: {
        type: String,
        trim: true
    },
    pickupLocation: {
        type: String,
        trim: true
    },
    dropoffLocation: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

// Validate that end date is after start date
bookingSchema.pre('save', function (next) {
    if (this.endDate <= this.startDate) {
        next(new Error('End date must be after start date'));
    }
    next();
});

// Calculate total days automatically
bookingSchema.pre('save', function (next) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    next();
});

// Index for efficient queries
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ vehicle: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
