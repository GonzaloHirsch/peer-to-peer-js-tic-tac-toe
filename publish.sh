#!/bin/bash

BASEDIR=$1

# Create the dist folder
echo "Creating folders..."
mkdir -p dist/assets
mkdir -p dist/assets/js
mkdir -p dist/assets/css
mkdir -p dist/assets/icons

# Copy all required files there
echo "Copying static assets..."
cp $BASEDIR/index.html dist/index.html
cp $BASEDIR/favicon.png dist/favicon.png
cp $BASEDIR/meta-img.webp dist/meta-img.webp
cp $BASEDIR/robots.txt dist/robots.txt
cp $BASEDIR/sitemap.xml dist/sitemap.xml
cp -r $BASEDIR/assets/icons/ dist/assets/icons/

# Minify the JS files
echo ""
echo "Minifying JS..."
for file in $BASEDIR/assets/js/*.js; do
    # Ensure it's a file not a directory
    [ -f "$file" ] || break
    echo "Processing $file"
    # Get filename and dir
    filename=$(echo $file | rev | cut -d '/' -f 1 | rev)
    directory=$(echo $file | sed -e "s/$filename//g")
    # Make sure the tmp folder is there
    mkdir -p "/tmp/$directory"
    # Uglify on a temp space
    temp_file="/tmp/$file"
    uglifyjs --compress --mangle --no-annotations --keep-fnames --output $temp_file $file
    # Get MD5 of contents
    file_md5=($(md5sum $temp_file))
    echo "MD5 for $file is $file_md5"
    # Copy to destination with MD5
    final_filename=$(echo $filename | sed -e "s/\.js/_$file_md5\.js/g")
    echo "Final filename for $file is $final_filename"
    cp $temp_file "dist/assets/js/$final_filename"
done

# Minify the CSS files
echo ""
echo "Minifying CSS..."
for file in $BASEDIR/assets/css/*.css; do
    # Ensure it's a file not a directory
    [ -f "$file" ] || break
    echo "Processing $file"
    # Get filename and dir
    filename=$(echo $file | rev | cut -d '/' -f 1 | rev)
    directory=$(echo $file | sed -e "s/$filename//g")
    # Make sure the tmp folder is there
    mkdir -p "/tmp/$directory"
    # Uglify on a temp space
    temp_file="/tmp/$file"
    uglifycss --ugly-comments $file >$temp_file
    # Get MD5 of contents
    file_md5=($(md5sum $temp_file))
    echo "MD5 for $file is $file_md5"
    # Copy to destination with MD5
    final_filename=$(echo $filename | sed -e "s/\.css/_$file_md5\.css/g")
    echo "Final filename for $file is $final_filename"
    cp $temp_file "dist/assets/css/$final_filename"
done
