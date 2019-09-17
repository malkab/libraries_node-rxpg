#!/bin/bash

# --------------------------------
#
# Runs an interactive Node session for development
#
# Main Node dev container
#  
# --------------------------------

# Dev container name
DEV_CONTAINER_NAME=rxpg-node-dev
# Node version image
NODE_VERSION=v10.16.0
# Debug port
DEV_DEBUG_PORT=9007
# Network to connect to. Remember that when attaching to the network
# of an existing container (using container:name) the HOST is
# "localhost"
NETWORK=rxpg-network



# Container run

if [ -z "${NETWORK}" ]; then

    docker run -ti --rm \
        --name $DEV_CONTAINER_NAME \
        -v $(pwd)/../node/:$(pwd)/../node/ \
        -v ~/.npmrc:/root/.npmrc \
        --workdir $(pwd)/../node/ \
        --entrypoint /bin/bash \
        -p $DEV_DEBUG_PORT:9229 \
        malkab/nodejs-dev:$NODE_VERSION

else

    docker run -ti --rm \
        --name $DEV_CONTAINER_NAME \
        --network=$NETWORK \
        -v $(pwd)/../node/:$(pwd)/../node/ \
        -v ~/.npmrc:/root/.npmrc \
        --workdir $(pwd)/../node/ \
        --entrypoint /bin/bash \
        -p $DEV_DEBUG_PORT:9229 \
        malkab/nodejs-dev:$NODE_VERSION

fi
