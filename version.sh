#!/bin/bash -e

VERSION=$1
TARGET_DIR="dist"

function add_version() {
    target_file=$1
    version=$2
    cat $target_file | sed -e "s/VERSION_HERE/$version/g" >$target_file.tmp
    mv $target_file.tmp $target_file
}

add_version $TARGET_DIR/index.html $VERSION
add_version $TARGET_DIR/error.html $VERSION
