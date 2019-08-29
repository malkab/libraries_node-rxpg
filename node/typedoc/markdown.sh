#!/bin/bash

# This script only works if run in the node folder
# All relative paths are refered to the node folder

TYPEDOC_EXEC=../node_modules/.bin/typedoc
ROOT_BUILD_DIR=./build
BUILD_DIR=$ROOT_BUILD_DIR/markdown

rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR

cat > $ROOT_BUILD_DIR/README.md <<'endmsg'
This is the TypeDoc Markdown build, can be deleted.
endmsg

$TYPEDOC_EXEC \
    --theme markdown \
    --out $BUILD_DIR \
    --options ./typedoc.json
