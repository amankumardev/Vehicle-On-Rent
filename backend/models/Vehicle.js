const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide vehicle name'],
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Please specify vehicle type'],
        enum: ['car', 'suv', 'bike', 'scooter', 'luxury', 'van'],
        lowercase: true
    },
    brand: {
        type: String,
        required: [true, 'Please provide vehicle brand'],
        trim: true
    },
    model: {
        type: String,
        required: [true, 'Please provide vehicle model'],
        trim: true
    },
    year: {
        type: Number,
        required: [true, 'Please provide vehicle year']
    },
    description: {
        type: String,
        required: [true, 'Please provide vehicle description'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    pricePerDay: {
        type: Number,
        required: [true, 'Please provide price per day'],
        min: [0, 'Price cannot be negative']
    },
    features: [{
        type: String,
        trim: true
    }],
    images: [{
        type: String,
        required: true
    }],
    specifications: {
        seats: {
            type: Number,
            required: true,
            min: 1
        },
        transmission: {
            type: String,
            enum: ['manual', 'automatic'],
            required: true
        },
        fuelType: {
            type: String,
            enum: ['petrol', 'diesel', 'electric', 'hybrid'],
            required: true
        },
        mileage: {
            type: String,
            trim: true
        },
        engineCapacity: {
            type: String,
            trim: true
        }
    },
    location: {
        city: {
            type: String,
            required: true,
            trim: true
        },
        address: {
            type: String,
            trim: true
        }
    },
    availability: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for search optimization
vehicleSchema.index({ name: 'text', brand: 'text', model: 'text' });
vehicleSchema.index({ type: 1, pricePerDay: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
