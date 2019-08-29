#!/bin/bash

. ../env.env

# Runs a Redis server

docker run -ti --rm \
    --name $DEV_REDIS_CONTAINERNAME \
    -v $(pwd)/redis-data/:/data \
    -v $(pwd):/ext-src/ \
    -v $(pwd)/config/redis.conf:/redis.conf:ro \
    --workdir /ext-src/ \
    --entrypoint /bin/bash \
    redis:4.0 \
    -c "redis-server /redis.conf --appendonly yes"
