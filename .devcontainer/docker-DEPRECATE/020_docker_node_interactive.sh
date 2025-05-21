#!/bin/bash

docker run -ti --rm \
    -e NODE_ENV=development \
    -e NODE_MEMORY=2GB \
    --network=rxpg \
    -v ~/.npmrc:/root/.npmrc \
    -v ~/.npmrc:/home/node/.npmrc \
    -v $(pwd):/ext_src \
    -v $(pwd)/../node/:$(pwd)/../node/ \
    --workdir $(pwd)/../node/ \
    --user 1000:1000 \
    malkab/nodejs-dev:16.13.2
