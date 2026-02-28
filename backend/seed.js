const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('./models/Vehicle');

dotenv.config();

// Sample vehicle data with local public images
const sampleVehicles = [
    {
        name: 'Toyota Camry 2024',
        type: 'car',
        brand: 'Toyota',
        model: 'Camry',
        year: 2024,
        description: 'A reliable and comfortable sedan perfect for daily commutes and long drives. Features modern amenities and excellent fuel efficiency.',
        pricePerDay: 45,
        features: ['Bluetooth', 'Backup Camera', 'Cruise Control', 'USB Ports', 'Air Conditioning'],
        images: ['/images/cars/car-1.png'],
        specifications: {
            seats: 5,
            transmission: 'automatic',
            fuelType: 'petrol',
            mileage: '32 MPG',
            engineCapacity: '2.5L'
        },
        location: {
            city: 'New York',
            address: '123 Main Street'
        },
        availability: true,
        rating: 4.5,
        totalReviews: 127
    },
    {
        name: 'Honda CR-V 2024',
        type: 'suv',
        brand: 'Honda',
        model: 'CR-V',
        year: 2024,
        description: 'Spacious SUV with excellent cargo space, perfect for family trips and outdoor adventures. Comes with advanced safety features.',
        pricePerDay: 65,
        features: ['All-Wheel Drive', 'Sunroof', 'Navigation', 'Leather Seats', 'Heated Seats'],
        images: ['/images/cars/car-2.png'],
        specifications: {
            seats: 7,
            transmission: 'automatic',
            fuelType: 'petrol',
            mileage: '28 MPG',
            engineCapacity: '1.5L Turbo'
        },
        location: {
            city: 'Los Angeles',
            address: '456 Oak Avenue'
        },
        availability: true,
        rating: 4.7,
        totalReviews: 89
    },
    {
        name: 'BMW 5 Series',
        type: 'luxury',
        brand: 'BMW',
        model: '5 Series',
        year: 2024,
        description: 'Luxury sedan offering premium comfort and cutting-edge technology. Experience the thrill of German engineering.',
        pricePerDay: 120,
        features: ['Premium Sound System', 'Massage Seats', 'Adaptive Cruise Control', 'Wireless Charging', 'Ambient Lighting'],
        images: ['/images/cars/car-1.png'],
        specifications: {
            seats: 5,
            transmission: 'automatic',
            fuelType: 'petrol',
            mileage: '26 MPG',
            engineCapacity: '3.0L'
        },
        location: {
            city: 'Miami',
            address: '789 Beach Road'
        },
        availability: true,
        rating: 4.9,
        totalReviews: 156
    },
    {
        name: 'Tesla Model 3',
        type: 'luxury',
        brand: 'Tesla',
        model: 'Model 3',
        year: 2024,
        description: 'All-electric luxury sedan with autopilot capabilities and zero emissions. Experience the future of driving.',
        pricePerDay: 95,
        features: ['Autopilot', 'Supercharging', 'Glass Roof', 'Premium Audio', 'Mobile App Control'],
        images: ['/images/cars/car-2.png'],
        specifications: {
            seats: 5,
            transmission: 'automatic',
            fuelType: 'electric',
            mileage: '350 miles range',
            engineCapacity: 'Electric Motor'
        },
        location: {
            city: 'San Francisco',
            address: '321 Tech Street'
        },
        availability: true,
        rating: 4.8,
        totalReviews: 203
    },
    {
        name: 'Ford F-150 Raptor',
        type: 'suv',
        brand: 'Ford',
        model: 'F-150 Raptor',
        year: 2024,
        description: 'Powerful pickup truck built for adventure. Perfect for off-road trips and heavy-duty work.',
        pricePerDay: 85,
        features: ['4x4', 'Tow Package', 'Off-Road Suspension', 'Bed Liner', 'Running Boards'],
        images: ['/images/cars/car-1.png'],
        specifications: {
            seats: 5,
            transmission: 'automatic',
            fuelType: 'petrol',
            mileage: '18 MPG',
            engineCapacity: '3.5L V6'
        },
        location: {
            city: 'Dallas',
            address: '555 Ranch Road'
        },
        availability: true,
        rating: 4.6,
        totalReviews: 94
    },
    {
        name: 'Yamaha R15',
        type: 'bike',
        brand: 'Yamaha',
        model: 'R15',
        year: 2024,
        description: 'Sporty motorcycle perfect for city rides and weekend getaways. Fuel-efficient and easy to handle.',
        pricePerDay: 25,
        features: ['ABS', 'Digital Display', 'LED Lights', 'Quick Shifter'],
        images: ['/images/bikes/bike-1.png'],
        specifications: {
            seats: 2,
            transmission: 'manual',
            fuelType: 'petrol',
            mileage: '50 MPG',
            engineCapacity: '155cc'
        },
        location: {
            city: 'Seattle',
            address: '777 Bike Lane'
        },
        availability: true,
        rating: 4.4,
        totalReviews: 67
    },
    {
        name: 'Kawasaki Ninja 400',
        type: 'bike',
        brand: 'Kawasaki',
        model: 'Ninja 400',
        year: 2024,
        description: 'High-performance sport bike with aggressive styling. Perfect for thrill-seekers who love speed.',
        pricePerDay: 35,
        features: ['ABS', 'Slipper Clutch', 'LED Headlights', 'Digital Instrument Cluster'],
        images: ['/images/bikes/bike-2.png'],
        specifications: {
            seats: 2,
            transmission: 'manual',
            fuelType: 'petrol',
            mileage: '55 MPG',
            engineCapacity: '399cc'
        },
        location: {
            city: 'Austin',
            address: '222 Speed Avenue'
        },
        availability: true,
        rating: 4.6,
        totalReviews: 52
    },
    {
        name: 'Harley Davidson Street 750',
        type: 'bike',
        brand: 'Harley Davidson',
        model: 'Street 750',
        year: 2024,
        description: 'Classic cruiser motorcycle with a powerful engine and iconic design. Ride in style on the open road.',
        pricePerDay: 55,
        features: ['V-Twin Engine', 'Chrome Exhaust', 'Leather Saddlebags', 'ABS'],
        images: ['/images/bikes/bike-3.png'],
        specifications: {
            seats: 2,
            transmission: 'manual',
            fuelType: 'petrol',
            mileage: '42 MPG',
            engineCapacity: '749cc'
        },
        location: {
            city: 'Chicago',
            address: '333 Cruise Road'
        },
        availability: true,
        rating: 4.8,
        totalReviews: 91
    },
    {
        name: 'Mercedes-Benz Sprinter Van',
        type: 'van',
        brand: 'Mercedes-Benz',
        model: 'Sprinter',
        year: 2024,
        description: 'Spacious van perfect for group travel and cargo transportation. Comfortable and reliable.',
        pricePerDay: 110,
        features: ['12 Passenger Seats', 'Luggage Rack', 'Air Conditioning', 'USB Ports', 'Bluetooth'],
        images: ['/images/vans/van-1.png'],
        specifications: {
            seats: 12,
            transmission: 'automatic',
            fuelType: 'diesel',
            mileage: '22 MPG',
            engineCapacity: '2.0L Turbo Diesel'
        },
        location: {
            city: 'Chicago',
            address: '888 Transit Avenue'
        },
        availability: true,
        rating: 4.5,
        totalReviews: 81
    },
    {
        name: 'Hyundai Elantra',
        type: 'car',
        brand: 'Hyundai',
        model: 'Elantra',
        year: 2024,
        description: 'Affordable and fuel-efficient sedan ideal for budget-conscious travelers. Great value for money.',
        pricePerDay: 35,
        features: ['Apple CarPlay', 'Lane Assist', 'Forward Collision Warning', 'Rear Cross Traffic Alert'],
        images: ['/images/cars/car-2.png'],
        specifications: {
            seats: 5,
            transmission: 'automatic',
            fuelType: 'petrol',
            mileage: '35 MPG',
            engineCapacity: '2.0L'
        },
        location: {
            city: 'Boston',
            address: '999 College Street'
        },
        availability: true,
        rating: 4.3,
        totalReviews: 112
    }
];

// Connect to MongoDB and seed data
async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        // Clear existing vehicles
        await Vehicle.deleteMany({});
        console.log('✓ Cleared existing vehicles');

        // Insert sample vehicles
        await Vehicle.insertMany(sampleVehicles);
        console.log(`✓ Inserted ${sampleVehicles.length} sample vehicles`);

        console.log('\n✅ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('✗ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
