const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const { initDatabase } = require('./config/database');
const User = require('./models/User');
const Reservation = require('./models/Reservation');
const Ticket = require('./models/Ticket');
const Parcel = require('./models/Parcel');
const Visitor = require('./models/Visitor');
const { seedResidents } = require('./utils/seed');

// Define associations
User.hasMany(Reservation, { foreignKey: 'userId' });
Reservation.belongsTo(User, { foreignKey: 'userId' });

// Ticket associations
User.hasMany(Ticket, { foreignKey: 'userId', as: 'CreatedTickets' });
Ticket.belongsTo(User, { foreignKey: 'userId', as: 'Creator' });

User.hasMany(Ticket, { foreignKey: 'assignedTo', as: 'AssignedTickets' });
Ticket.belongsTo(User, { foreignKey: 'assignedTo', as: 'AssignedStaff' });

// Parcel associations
User.hasMany(Parcel, { foreignKey: 'userId', as: 'UserParcels' });
Parcel.belongsTo(User, { foreignKey: 'userId', as: 'Resident' });

// Visitor associations
User.hasMany(Visitor, { foreignKey: 'userId', as: 'UserVisitors' });
Visitor.belongsTo(User, { foreignKey: 'userId', as: 'Resident' });

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS
app.use(compression()); // Response compression
app.use(morgan('dev')); // Logging
app.use(express.json()); // JSON parser
app.use(express.urlencoded({ extended: true })); // URL-encoded parser

// Routes
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/users', require('./routes/user.routes'));
app.use('/api/v1/announcements', require('./routes/announcement.routes'));
app.use('/api/v1/payments', require('./routes/payment.routes'));
app.use('/api/v1/tickets', require('./routes/ticket.routes'));
app.use('/api/v1/visitors', require('./routes/visitor.routes'));
app.use('/api/v1/parcels', require('./routes/parcel.routes'));
app.use('/api/v1/reservations', require('./routes/reservation.routes'));
app.use('/api/v1/marketplace', require('./routes/marketplace.routes'));
app.use('/api/v1/polls', require('./routes/poll.routes'));
app.use('/api/v1/dashboard', require('./routes/dashboard.routes'));
app.use('/api/v1/chatbot', require('./routes/chatbot.routes'));
app.use('/api/v1/notifications', require('./routes/notification.routes'));
app.use('/api/v1/ai-analytics', require('./routes/ai-analytics.routes'));
app.use('/api/v1/vehicles', require('./routes/vehicle.routes'));
app.use('/api/v1/vehicle-logs', require('./routes/vehicle-log.routes'));
app.use('/api/v1/lpr', require('./routes/lpr.routes'));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Çardak API'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', async() => {
    console.log(`🚀 Çardak API running on port ${PORT}`);
    console.log(`📱 Access from phone: http://<YOUR_IP>:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV}`);

    // Initialize database and wait for it to be ready
    await initDatabase();

    // Now seed the data
    await seedResidents();
});

module.exports = app;