# ESLint Configuration Guide

## 🎯 What's Configured

ESLint is now set up to detect:
- ✅ **Unused variables** - variables declared but never used
- ✅ **Console statements** - `console.log()` in production code
- ✅ **Unreachable code** - code after return statements
- ✅ **Duplicate imports** - importing the same module twice
- ✅ **Deprecated syntax** - using `var` instead of `const/let`
- ✅ **React hooks issues** - missing dependencies in useEffect

## 📋 Available Commands

### Check for issues:
```bash
pnpm run lint
```

### Auto-fix issues (where possible):
```bash
pnpm run lint:fix
```

## 🔍 Current Issues Found

ESLint found **102 warnings** in your code:

### Unused Variables (Main Issues):
1. **AdminDashboard.js**: `handleRoomFloorFilterChange` - defined but never used
2. **BookingPage.js**: `Bed`, `MapPin` - imported but never used
3. **HomePage.js**: `ChevronLeft`, `ChevronRight`, `currentRoomIndex`, `prevRoom` - unused
4. **LoginPage.js**: `Lock`, `Mail`, `demoLogin` - unused
5. **ManagerDashboard.js**: `DoorOpen` - unused
6. **OffersPage.js**: `Percent` - unused
7. **UserProfilePage.js**: `Mail`, `Phone`, `MapPin`, `Calendar`, `CreditCard`, `Hash`, `Shield`, `Briefcase`, `Award`, `Clock` - unused imports

### Console Statements:
- Multiple `console.log()` statements throughout services and components
- These should be removed or replaced with proper logging in production

## 🛠️ How to Fix

### 1. Automatic Fixes
Many issues can be fixed automatically:
```bash
cd /home/lahiru/Videos/SkyNest_Hotels/frontend
pnpm run lint:fix
```

### 2. Manual Fixes Required

#### Remove Unused Imports:
```javascript
// Before
import { Lock, Mail, User } from 'lucide-react';

// After (if Lock and Mail are not used)
import { User } from 'lucide-react';
```

#### Remove Unused Variables:
```javascript
// Before
const handleRoomFloorFilterChange = (e) => {
  // ... code never called
};

// After - Delete the entire function if not used
```

#### Handle Console Statements:
```javascript
// Option 1: Remove in production
// console.log('Debug info');

// Option 2: Use a proper logger
// logger.debug('Debug info');

// Option 3: Keep for development only (add comment)
// eslint-disable-next-line no-console
console.log('Important debug info');
```

## 📝 ESLint Rules Explained

| Rule | Level | Description |
|------|-------|-------------|
| `no-unused-vars` | warn | Variables must be used after declaration |
| `no-console` | warn | Avoid console statements in production |
| `no-debugger` | warn | Remove debugger statements |
| `no-unreachable` | error | Code after return is unreachable |
| `no-duplicate-imports` | error | Import from same module once |
| `prefer-const` | warn | Use const for variables that don't change |
| `no-var` | warn | Use let/const instead of var |

## 🎨 VS Code Integration

ESLint should automatically show warnings in VS Code:
- Yellow underlines = warnings
- Red underlines = errors

To see all issues: **View → Problems** (Ctrl+Shift+M)

## 🚀 Next Steps

1. Run `pnpm run lint:fix` to auto-fix simple issues
2. Review remaining warnings and fix manually
3. Remove unused imports and variables
4. Clean up console.log statements
5. Run `pnpm run lint` again to verify

## 📚 Learn More

- [ESLint Rules](https://eslint.org/docs/rules/)
- [React ESLint Plugin](https://github.com/jsx-eslint/eslint-plugin-react)
- [ESLint Hooks Plugin](https://www.npmjs.com/package/eslint-plugin-react-hooks)
