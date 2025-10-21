#!/bin/bash

# Script to update frontend files with logger
# This replaces console.error and console.log with proper logger calls

cd /home/lahiru/Com/SkyNest_Hotels/frontend/src

echo "Updating frontend files with logger..."

# Function to add logger import if not present
add_logger_import() {
    local file=$1
    if ! grep -q "import logger from" "$file"; then
        # Calculate relative path to logger based on file location
        local depth=$(echo "$file" | grep -o "/" | wc -l)
        local rel_path=""
        if [[ $file == components/* ]]; then
            rel_path="../utils/logger"
        elif [[ $file == components/manager/* ]] || [[ $file == components/Reports/* ]]; then
            rel_path="../../utils/logger"
        elif [[ $file == services/* ]]; then
            rel_path="../utils/logger"
        else
            rel_path="./utils/logger"
        fi
        
        # Add import at the beginning after existing imports
        sed -i.bak "1i import logger from '$rel_path';" "$file"
        echo "  Added logger import to $file"
    fi
}

# Update services
echo "Updating service files..."
for file in services/*.js; do
    if [ -f "$file" ]; then
        echo "  Processing $file..."
        sed -i.bak \
            -e "s/console\.error('\\([^']*\\) error:', error);/logger.error('\\1 error', error);/g" \
            -e "s/console\.error('\\([^']*\\)', error);/logger.error('\\1', error);/g" \
            -e "s/console\.log('\\([^']*\\)', \\([^)]*\\));/logger.debug('\\1', \\2);/g" \
            -e "s/console\.log('\\([^']*\\)');/logger.debug('\\1');/g" \
            "$file"
    fi
done

# Update components
echo "Updating component files..."
for file in components/*.js; do
    if [ -f "$file" ]; then
        echo "  Processing $file..."
        sed -i.bak \
            -e "s/console\.error('\\([^']*\\)', error);/logger.error('\\1', error);/g" \
            -e "s/console\.error('\\([^']*\\):', error);/logger.error('\\1', error);/g" \
            -e "s/console\.log('\\([^']*\\)', \\([^)]*\\));/logger.debug('\\1', \\2);/g" \
            -e "s/console\.log('\\([^']*\\)');/logger.debug('\\1');/g" \
            "$file"
    fi
done

# Update manager components
echo "Updating manager component files..."
for file in components/manager/*.js; do
    if [ -f "$file" ]; then
        echo "  Processing $file..."
        sed -i.bak \
            -e "s/console\.error('\\([^']*\\)', error);/logger.error('\\1', error);/g" \
            -e "s/console\.error('\\([^']*\\):', error);/logger.error('\\1', error);/g" \
            -e "s/console\.log('\\([^']*\\)', \\([^)]*\\));/logger.debug('\\1', \\2);/g" \
            "$file"
    fi
done

# Update report components
echo "Updating report component files..."
for file in components/Reports/*.js; do
    if [ -f "$file" ]; then
        echo "  Processing $file..."
        sed -i.bak \
            -e "s/console\.error(err);/logger.error('Error in report', err);/g" \
            -e "s/console\.error('\\([^']*\\)', error);/logger.error('\\1', error);/g" \
            "$file"
    fi
done

echo ""
echo "✅ All frontend files updated!"
echo "📝 Backup files created with .bak extension"
echo ""
echo "⚠️  Note: Logger imports need to be added manually to files"
echo "   The logger will be imported from '../utils/logger' or '../../utils/logger'"
echo ""
echo "To remove backup files after verification:"
echo "  find . -name '*.bak' -delete"
