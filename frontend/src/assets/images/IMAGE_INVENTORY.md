# Sky Nest Hotels - Image Inventory

This document lists all external images that have been downloaded from Unsplash and their corresponding local paths.

## Overview
All external images have been downloaded and stored locally to improve performance and reduce dependency on external URLs. The images are organized by component and usage.

---

## IntroPage Component

### Background Images
| Usage | Original URL | Local Path | Description |
|-------|-------------|------------|-------------|
| Fallback Background | `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920` | `/assets/images/external/intro/hotel-background.jpg` | Luxury hotel exterior fallback image |

---

## HomePage Component

### Hero Section
| Usage | Original URL | Local Path | Description |
|-------|-------------|------------|-------------|
| Hero Background | `https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920` | `/assets/images/external/home/hero-background.jpg` | Elegant hotel lobby background |

### Room Types (Fallback Images)
| Room Type | Original URL | Local Path | Description |
|-----------|-------------|------------|-------------|
| Standard Double Room | `https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800` | `/assets/images/external/home/standard-room.jpg` | Modern standard hotel room |
| Deluxe Suite | `https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800` | `/assets/images/external/home/deluxe-suite.jpg` | Spacious deluxe suite interior |
| Family Room | `https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800` | `/assets/images/external/home/family-room.jpg` | Family-friendly room setup |

### Facilities (Fallback Images)
| Facility | Original URL | Local Path | Description |
|----------|-------------|------------|-------------|
| Swimming Pool | `https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600` | `/assets/images/external/home/swimming-pool.jpg` | Luxury hotel swimming pool |
| Luxury Spa | `https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600` | `/assets/images/external/home/luxury-spa.jpg` | Relaxing spa environment |
| Fine Dining | `https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600` | `/assets/images/external/home/fine-dining.jpg` | Elegant restaurant interior |
| Fitness Center | `https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600` | `/assets/images/external/home/fitness-center.jpg` | Modern gym equipment |
| Conference Hall | `https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600` | `/assets/images/external/home/conference-hall.jpg` | Professional meeting space |

---

## OffersPage Component

### Special Offers (Fallback Images)
| Offer | Original URL | Local Path | Description |
|-------|-------------|------------|-------------|
| Early Bird Special | `https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600` | `/assets/images/external/offers/early-bird-special.jpg` | Luxury hotel room for early bookings |
| Weekend Getaway | `https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600` | `/assets/images/external/offers/weekend-getaway.jpg` | Cozy weekend retreat setting |
| Long Stay Discount | `https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600` | `/assets/images/external/offers/long-stay-discount.jpg` | Extended stay accommodation |
| Honeymoon Package | `https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600` | `/assets/images/external/offers/honeymoon-package.jpg` | Romantic suite for couples |
| Group Booking Special | `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600` | `/assets/images/external/offers/group-booking-special.jpg` | Hotel exterior for group bookings |
| Summer Paradise | `https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600` | `/assets/images/external/offers/summer-paradise.jpg` | Summer vacation atmosphere |

---

## Usage Instructions

### For Developers
1. **Public Path**: Use `/assets/images/external/[component]/[filename].jpg` as the path (files are in public folder)
2. **Fallback Strategy**: Update component fallback URLs to use these local paths
3. **Build Process**: Files in public folder are automatically served by React

### For Updates
- When adding new external images, follow the same folder structure
- Update this inventory document with new additions
- Test all image paths in development and production builds

---

## File Structure
```
public/assets/images/external/
├── intro/
│   └── hotel-background.jpg
├── home/
│   ├── hero-background.jpg
│   ├── standard-room.jpg
│   ├── deluxe-suite.jpg
│   ├── family-room.jpg
│   ├── swimming-pool.jpg
│   ├── luxury-spa.jpg
│   ├── fine-dining.jpg
│   ├── fitness-center.jpg
│   └── conference-hall.jpg
└── offers/
    ├── early-bird-special.jpg
    ├── weekend-getaway.jpg
    ├── long-stay-discount.jpg
    ├── honeymoon-package.jpg
    ├── group-booking-special.jpg
    └── summer-paradise.jpg
```

---

## Performance Benefits
- **Reduced External Dependencies**: No reliance on external CDNs
- **Faster Load Times**: Images served from same domain
- **Offline Capability**: Images available when external services are down
- **Consistent Quality**: Guaranteed image availability and quality

---

*Last Updated: October 7, 2025*
*Total Images Downloaded: 16*