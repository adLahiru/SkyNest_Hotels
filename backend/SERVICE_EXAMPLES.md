# Quick Service Catalogue Examples

## Sample Services to Add

Here are ready-to-use cURL commands to populate your service catalogue with common hotel services:

### Spa Services

```bash
# Swedish Massage
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Spa - Swedish Massage (60 min)",
    "category": "Spa",
    "unit_price": 85.00,
    "is_active": true
  }'

# Deep Tissue Massage
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Spa - Deep Tissue Massage (60 min)",
    "category": "Spa",
    "unit_price": 95.00,
    "is_active": true
  }'

# Facial Treatment
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Spa - Deluxe Facial Treatment",
    "category": "Spa",
    "unit_price": 75.00,
    "is_active": true
  }'

# Aromatherapy Session
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Spa - Aromatherapy Session",
    "category": "Spa",
    "unit_price": 65.00,
    "is_active": true
  }'
```

### Bar Services

```bash
# Signature Cocktail
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Bar - Signature Cocktail",
    "category": "Bar",
    "unit_price": 12.50,
    "is_active": true
  }'

# Premium Wine (Glass)
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Bar - Premium Wine (Glass)",
    "category": "Bar",
    "unit_price": 15.00,
    "is_active": true
  }'

# Craft Beer
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Bar - Craft Beer",
    "category": "Bar",
    "unit_price": 8.50,
    "is_active": true
  }'

# Non-Alcoholic Mocktail
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Bar - Fresh Fruit Mocktail",
    "category": "Bar",
    "unit_price": 7.00,
    "is_active": true
  }'
```

### Restaurant Services

```bash
# Continental Breakfast
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Restaurant - Continental Breakfast",
    "category": "Restaurant",
    "unit_price": 18.00,
    "is_active": true
  }'

# Buffet Dinner
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Restaurant - Buffet Dinner",
    "category": "Restaurant",
    "unit_price": 35.00,
    "is_active": true
  }'

# A La Carte Lunch
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Restaurant - A La Carte Lunch",
    "category": "Restaurant",
    "unit_price": 25.00,
    "is_active": true
  }'
```

### Room Service

```bash
# In-Room Breakfast
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Room Service - Breakfast Delivery",
    "category": "Room Service",
    "unit_price": 22.00,
    "is_active": true
  }'

# Late Night Snack
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Room Service - Late Night Snack",
    "category": "Room Service",
    "unit_price": 15.00,
    "is_active": true
  }'

# Minibar Restocking
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Room Service - Minibar Restocking",
    "category": "Room Service",
    "unit_price": 5.00,
    "is_active": true
  }'
```

### Laundry Services

```bash
# Express Laundry
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Laundry - Express Service (4 hours)",
    "category": "Laundry",
    "unit_price": 25.00,
    "is_active": true
  }'

# Standard Dry Cleaning
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Laundry - Dry Cleaning (24 hours)",
    "category": "Laundry",
    "unit_price": 18.00,
    "is_active": true
  }'

# Ironing Service
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Laundry - Professional Ironing",
    "category": "Laundry",
    "unit_price": 8.00,
    "is_active": true
  }'
```

### Transportation Services

```bash
# Airport Shuttle
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Transportation - Airport Shuttle (One Way)",
    "category": "Transportation",
    "unit_price": 35.00,
    "is_active": true
  }'

# Car Rental (Daily)
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Transportation - Car Rental (24 hours)",
    "category": "Transportation",
    "unit_price": 65.00,
    "is_active": true
  }'

# Valet Parking
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Transportation - Valet Parking (Per Day)",
    "category": "Transportation",
    "unit_price": 20.00,
    "is_active": true
  }'
```

### Fitness & Recreation

```bash
# Personal Training
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Fitness - Personal Training (1 hour)",
    "category": "Fitness",
    "unit_price": 55.00,
    "is_active": true
  }'

# Pool Cabana Rental
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Recreation - Pool Cabana (Full Day)",
    "category": "Recreation",
    "unit_price": 45.00,
    "is_active": true
  }'

# Tennis Court Rental
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Recreation - Tennis Court (Per Hour)",
    "category": "Recreation",
    "unit_price": 30.00,
    "is_active": true
  }'
```

### Business Services

```bash
# Meeting Room Rental
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Business - Meeting Room (Per Hour)",
    "category": "Business",
    "unit_price": 75.00,
    "is_active": true
  }'

# Business Center Access
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Business - Business Center (Daily Pass)",
    "category": "Business",
    "unit_price": 15.00,
    "is_active": true
  }'

# Document Printing
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Business - Document Printing (Per Page)",
    "category": "Business",
    "unit_price": 0.50,
    "is_active": true
  }'
```

### Concierge Services

```bash
# City Tour Booking
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Concierge - City Tour Arrangement",
    "category": "Concierge",
    "unit_price": 10.00,
    "is_active": true
  }'

# Restaurant Reservation
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Concierge - Premium Restaurant Reservation",
    "category": "Concierge",
    "unit_price": 5.00,
    "is_active": true
  }'

# Event Ticket Booking
curl -X POST http://localhost:8084/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "service_name": "Concierge - Event/Show Ticket Service",
    "category": "Concierge",
    "unit_price": 8.00,
    "is_active": true
  }'
```

---

## Bulk Import Script

Save this as a bash script to add all services at once:

```bash
#!/bin/bash

# Configuration
API_URL="http://localhost:8084/api/services"
ADMIN_TOKEN="YOUR_ADMIN_TOKEN_HERE"

# Function to create service
create_service() {
  curl -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "$1"
  echo ""
}

echo "Creating Spa Services..."
create_service '{"service_name":"Spa - Swedish Massage (60 min)","category":"Spa","unit_price":85.00}'
create_service '{"service_name":"Spa - Deep Tissue Massage (60 min)","category":"Spa","unit_price":95.00}'
create_service '{"service_name":"Spa - Deluxe Facial Treatment","category":"Spa","unit_price":75.00}'

echo "Creating Bar Services..."
create_service '{"service_name":"Bar - Signature Cocktail","category":"Bar","unit_price":12.50}'
create_service '{"service_name":"Bar - Premium Wine (Glass)","category":"Bar","unit_price":15.00}'
create_service '{"service_name":"Bar - Craft Beer","category":"Bar","unit_price":8.50}'

echo "Creating Restaurant Services..."
create_service '{"service_name":"Restaurant - Continental Breakfast","category":"Restaurant","unit_price":18.00}'
create_service '{"service_name":"Restaurant - Buffet Dinner","category":"Restaurant","unit_price":35.00}'

echo "Creating Laundry Services..."
create_service '{"service_name":"Laundry - Express Service (4 hours)","category":"Laundry","unit_price":25.00}'
create_service '{"service_name":"Laundry - Dry Cleaning (24 hours)","category":"Laundry","unit_price":18.00}'

echo "Creating Transportation Services..."
create_service '{"service_name":"Transportation - Airport Shuttle (One Way)","category":"Transportation","unit_price":35.00}'
create_service '{"service_name":"Transportation - Valet Parking (Per Day)","category":"Transportation","unit_price":20.00}'

echo "All services created successfully!"
```

**Usage:**
```bash
chmod +x create_services.sh
./create_services.sh
```

---

## Query Examples

```bash
# View all Spa services
curl -X GET "http://localhost:8084/api/services?category=Spa" \
  -H "Authorization: Bearer YOUR_TOKEN"

# View all active services
curl -X GET "http://localhost:8084/api/services?is_active=true" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get all categories
curl -X GET "http://localhost:8084/api/services/categories/list" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Price Update Examples

```bash
# Update Spa massage price
curl -X PUT "http://localhost:8084/api/services/SERVICE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"unit_price": 99.00}'

# Deactivate seasonal service
curl -X PUT "http://localhost:8084/api/services/SERVICE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"is_active": false}'
```

---

## Notes

1. **Replace `YOUR_ADMIN_TOKEN`** with actual admin JWT token
2. **Service IDs** are auto-generated UUIDs
3. **Prices** are in hotel's default currency
4. **Categories** can be customized based on your hotel's offerings
5. **Unit prices** represent per-use or per-hour rates

This provides a comprehensive starting point for your hotel's service catalogue!
