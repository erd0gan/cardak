// Model imports
const User = require('./User');
const Announcement = require('./Announcement');
const Payment = require('./Payment');
const Ticket = require('./Ticket');
const Visitor = require('./Visitor');
const Parcel = require('./Parcel');
const Reservation = require('./Reservation');
const MarketplaceItem = require('./MarketplaceItem');
const { Poll, PollVote } = require('./Poll');
const Notification = require('./Notification');
const ChatMessage = require('./ChatMessage');
const Vehicle = require('./Vehicle');
const VehicleLog = require('./VehicleLog');

// ============= USER RELATIONSHIPS =============

// User -> Announcements
User.hasMany(Announcement, { foreignKey: 'createdBy' });
Announcement.belongsTo(User, { foreignKey: 'createdBy' });

// User -> Payments
User.hasMany(Payment, { foreignKey: 'userId' });
Payment.belongsTo(User, { foreignKey: 'userId' });

// User -> Tickets
User.hasMany(Ticket, { foreignKey: 'userId', as: 'tickets' });
Ticket.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Ticket, { foreignKey: 'assignedTo', as: 'assignedTickets' });
Ticket.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

// User -> Visitors
User.hasMany(Visitor, { foreignKey: 'userId' });
Visitor.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Visitor, { foreignKey: 'checkedInBy', as: 'checkedInVisitors' });
Visitor.belongsTo(User, { foreignKey: 'checkedInBy', as: 'checkedInByUser' });

// User -> Parcels
User.hasMany(Parcel, { foreignKey: 'userId' });
Parcel.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Parcel, { foreignKey: 'receivedBy', as: 'receivedParcels' });
Parcel.belongsTo(User, { foreignKey: 'receivedBy', as: 'receiver' });

User.hasMany(Parcel, { foreignKey: 'deliveredBy', as: 'deliveredParcels' });
Parcel.belongsTo(User, { foreignKey: 'deliveredBy', as: 'deliverer' });

// User -> Reservations
User.hasMany(Reservation, { foreignKey: 'userId' });
Reservation.belongsTo(User, { foreignKey: 'userId' });

// User -> Marketplace
User.hasMany(MarketplaceItem, { foreignKey: 'userId' });
MarketplaceItem.belongsTo(User, { foreignKey: 'userId' });

// User -> Polls
User.hasMany(Poll, { foreignKey: 'createdBy' });
Poll.belongsTo(User, { foreignKey: 'createdBy' });

// User -> PollVotes
User.hasMany(PollVote, { foreignKey: 'userId' });
PollVote.belongsTo(User, { foreignKey: 'userId' });

// Poll -> PollVotes
Poll.hasMany(PollVote, { foreignKey: 'pollId' });
PollVote.belongsTo(Poll, { foreignKey: 'pollId' });

// User -> Notifications
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// User -> ChatMessages
User.hasMany(ChatMessage, { foreignKey: 'userId' });
ChatMessage.belongsTo(User, { foreignKey: 'userId' });

// Vehicle -> VehicleLogs
Vehicle.hasMany(VehicleLog, { foreignKey: 'vehicleId' });
VehicleLog.belongsTo(Vehicle, { foreignKey: 'vehicleId' });

// Export all models
module.exports = {
    User,
    Announcement,
    Payment,
    Ticket,
    Visitor,
    Parcel,
    Reservation,
    MarketplaceItem,
    Poll,
    PollVote,
    Notification,
    ChatMessage,
    Vehicle,
    VehicleLog,
};