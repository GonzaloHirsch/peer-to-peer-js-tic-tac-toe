#!/bin/bash -e

BASEDIR=$1
TARGET_DIR="dist"

# Clear dist folder
echo "Deleting previous artifacts..."
rm -rf $TARGET_DIR

# Create the dist folder
echo "Creating folders..."
mkdir -p $TARGET_DIR/assets
mkdir -p $TARGET_DIR/assets/js
mkdir -p $TARGET_DIR/assets/css
mkdir -p $TARGET_DIR/assets/icons

# Copy all required files there
echo "Copying static assets..."
cp $BASEDIR/index.html $TARGET_DIR/index.html
cp $BASEDIR/error.html $TARGET_DIR/error.html
cp $BASEDIR/favicon.png $TARGET_DIR/favicon.png
cp $BASEDIR/meta-img.webp $TARGET_DIR/meta-img.webp
cp $BASEDIR/robots.txt $TARGET_DIR/robots.txt
cp $BASEDIR/sitemap.xml $TARGET_DIR/sitemap.xml
cp -r $BASEDIR/assets/icons/ $TARGET_DIR/assets/icons/

function add_file_revving() {
    target_file=$1
    original_filename=$2
    revved_filename=$3
    cat $target_file | sed -e "s/$original_filename/$revved_filename/g" >$target_file.tmp
    mv $target_file.tmp $target_file
}

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
    cp $temp_file "$TARGET_DIR/assets/js/$final_filename"
    # Change it from the index file
    add_file_revving $TARGET_DIR/index.html $filename $final_filename
    add_file_revving $TARGET_DIR/error.html $filename $final_filename
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
    cp $temp_file "$TARGET_DIR/assets/css/$final_filename"
    # Change it from the index file
    add_file_revving $TARGET_DIR/index.html $filename $final_filename
    add_file_revving $TARGET_DIR/error.html $filename $final_filename
done
