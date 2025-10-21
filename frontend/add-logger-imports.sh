#!/bin/bash

# Script to add logger imports to frontend files that use logger but don't have the import

cd /home/lahiru/Com/SkyNest_Hotels/frontend/src

echo "Adding logger imports to frontend files..."

# Function to add logger import if logger is used but not imported
add_logger_import_if_needed() {
    local file=$1
    local rel_path=$2
    
    # Check if file uses logger but doesn't have import
    if grep -q "logger\." "$file" && ! grep -q "import logger from" "$file"; then
        # Find the last import line
        local last_import_line=$(grep -n "^import " "$file" | tail -1 | cut -d: -f1)
        
        if [ -n "$last_import_line" ]; then
            # Insert after last import
            sed -i "${last_import_line}a import logger from '$rel_path';" "$file"
            echo "  ✓ Added logger import to $file"
        else
            # No imports found, add at the beginning
            sed -i "1i import logger from '$rel_path';" "$file"
            echo "  ✓ Added logger import to $file (no existing imports)"
        fi
    fi
}

# Update services
echo "Checking service files..."
for file in services/*.js; do
    if [ -f "$file" ] && [ "$(basename $file)" != "index.js" ]; then
        add_logger_import_if_needed "$file" "../utils/logger"
    fi
done

# Update components
echo "Checking component files..."
for file in components/*.js; do
    if [ -f "$file" ]; then
        add_logger_import_if_needed "$file" "../utils/logger"
    fi
done

# Update manager components
echo "Checking manager component files..."
for file in components/manager/*.js; do
    if [ -f "$file" ]; then
        add_logger_import_if_needed "$file" "../../utils/logger"
    fi
done

# Update report components
echo "Checking report component files..."
for file in components/Reports/*.js; do
    if [ -f "$file" ]; then
        add_logger_import_if_needed "$file" "../../utils/logger"
    fi
done

echo ""
echo "✅ Logger imports added where needed!"
echo ""
echo "Summary:"
grep -r "import logger from" services components 2>/dev/null | wc -l | xargs echo "  Total files with logger import:"
