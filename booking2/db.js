"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.isRoomAvailable = isRoomAvailable;
exports.createBooking = createBooking;
var promise_1 = require("mysql2/promise");
// Create a connection pool
var pool = promise_1.default.createPool({
    host: 'localhost',
    user: 'root',
    password: '@Hkbag2003',
    database: 'hotel_booking_sync',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
exports.pool = pool;
// Check if a room is available for specific dates in a specific hotel branch
function isRoomAvailable(hotelBranchId, roomId, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
        var roomCheck, rows, bookingCount, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.execute('SELECT id FROM rooms WHERE id = ? AND hotel_branch_id = ?', [roomId, hotelBranchId])];
                case 1:
                    roomCheck = (_c.sent())[0];
                    if (!roomCheck || roomCheck.length === 0) {
                        throw new Error("Room ".concat(roomId, " does not exist in hotel branch ").concat(hotelBranchId));
                    }
                    return [4 /*yield*/, pool.execute("SELECT COUNT(*) as booking_count \n             FROM bookings b\n             JOIN rooms r ON b.room_id = r.id\n             WHERE b.room_id = ? \n             AND r.hotel_branch_id = ?\n             AND b.status = 'confirmed'\n             AND NOT (b.end_date <= ? OR b.start_date >= ?)", [roomId, hotelBranchId, startDate, endDate])];
                case 2:
                    rows = (_c.sent())[0];
                    bookingCount = (_b = (_a = rows === null || rows === void 0 ? void 0 : rows[0]) === null || _a === void 0 ? void 0 : _a.booking_count) !== null && _b !== void 0 ? _b : 1;
                    // If booking_count is 0, the room is available
                    return [2 /*return*/, bookingCount === 0];
                case 3:
                    err_1 = _c.sent();
                    console.error('Error checking room availability:', err_1);
                    throw err_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function createBooking(bookingData) {
    return __awaiter(this, void 0, void 0, function () {
        var connection, roomCheck, isAvailable, bookingReference, bookingResult, bookingId, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.getConnection()];
                case 1:
                    connection = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 9, 11, 12]);
                    // Start transaction
                    return [4 /*yield*/, connection.beginTransaction()];
                case 3:
                    // Start transaction
                    _a.sent();
                    return [4 /*yield*/, connection.execute('SELECT id, status FROM rooms WHERE id = ? AND hotel_branch_id = ?', [bookingData.roomId, bookingData.hotelBranchId])];
                case 4:
                    roomCheck = (_a.sent())[0];
                    if (!(roomCheck === null || roomCheck === void 0 ? void 0 : roomCheck[0])) {
                        throw new Error("Room ".concat(bookingData.roomId, " does not exist in hotel branch ").concat(bookingData.hotelBranchId));
                    }
                    return [4 /*yield*/, isRoomAvailable(bookingData.hotelBranchId, bookingData.roomId, bookingData.startDate, bookingData.endDate)];
                case 5:
                    isAvailable = _a.sent();
                    if (!isAvailable) {
                        throw new Error('Room is not available for the selected dates');
                    }
                    bookingReference = "BK".concat(Date.now()).concat(Math.floor(Math.random() * 1000));
                    return [4 /*yield*/, connection.execute("INSERT INTO bookings (\n                room_id,\n                channel_id,\n                booking_reference,\n                start_date,\n                end_date,\n                status\n            ) VALUES (?, ?, ?, ?, ?, 'confirmed')", [
                            bookingData.roomId,
                            bookingData.channelId,
                            bookingReference,
                            bookingData.startDate,
                            bookingData.endDate
                        ])];
                case 6:
                    bookingResult = (_a.sent())[0];
                    bookingId = bookingResult.insertId;
                    // 4. Update room status to booked
                    return [4 /*yield*/, connection.execute('UPDATE rooms SET status = \'booked\' WHERE id = ?', [bookingData.roomId])];
                case 7:
                    // 4. Update room status to booked
                    _a.sent();
                    // 5. Commit transaction
                    return [4 /*yield*/, connection.commit()];
                case 8:
                    // 5. Commit transaction
                    _a.sent();
                    return [2 /*return*/, {
                            bookingId: bookingId,
                            success: true,
                            message: "Booking created successfully with ID: ".concat(bookingId)
                        }];
                case 9:
                    error_1 = _a.sent();
                    // Rollback transaction on error
                    return [4 /*yield*/, connection.rollback()];
                case 10:
                    // Rollback transaction on error
                    _a.sent();
                    return [2 /*return*/, {
                            bookingId: 0,
                            success: false,
                            message: error_1.message || 'Failed to create booking'
                        }];
                case 11:
                    connection.release();
                    return [7 /*endfinally*/];
                case 12: return [2 /*return*/];
            }
        });
    });
}
// Test the connection
function testConnection() {
    return __awaiter(this, void 0, void 0, function () {
        var connection, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    connection = _a.sent();
                    console.log('Connected to MySQL database successfully!');
                    connection.release();
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _a.sent();
                    console.error('Error connecting to MySQL:', err_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Run initial connection test
testConnection();
