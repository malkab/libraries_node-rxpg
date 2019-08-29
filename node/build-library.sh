#!/bin/bash

# This script builds the library

DIST_LIBRARY_PATH=dist


# Drop existing build, just in case

rm -Rf $DIST_LIBRARY_PATH


# Build the lib

npm run build-lib


# Create docs

npm run builddocs:html

cp -R typedoc/build/html $DIST_LIBRARY_PATH/docs
