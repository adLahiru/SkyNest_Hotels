ALTER TABLE hotel_branches 
ADD COLUMN image_data MEDIUMBLOB COMMENT 'Binary data of branch image',
ADD COLUMN image_type VARCHAR(50) COMMENT 'MIME type of the image (e.g., image/jpeg, image/png)';