#!/bin/bash

# --------------------------------
#
# Execs into a running container
#
# Execs into the Node container
#  
# --------------------------------

# Name of the container to exec
DEV_CONTAINER_NAME=rxpg-node-dev



# Run

docker exec -ti \
    $DEV_CONTAINER_NAME \
    /bin/bash
