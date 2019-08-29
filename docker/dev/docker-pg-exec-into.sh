#!/bin/bash

# Execs into the PG container

. ../env.env

docker exec -ti \
    $DEV_PG_ONTAINERNAME \
    /bin/bash
