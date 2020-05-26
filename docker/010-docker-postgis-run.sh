#!/bin/bash

# -----------------------------------------------------------------
#
# Runs a test container for PostGIS.
#
# -----------------------------------------------------------------
#
# Creates a container with an instance of PostgreSQL, either interactive
# and volatile or persistent in a volume.
#  
# -----------------------------------------------------------------

# Interactive?
INTERACTIVE=true
# Network to connect to. Remember that when attaching to the network
# of an existing container (using container:name) the HOST is
# "localhost". Keep in mind that linking to a container and using the -p
# option for debugging results in a conflict. Use an external network if
# both features are needed
NETWORK=
# The port to expose to the host
PORT=5432
# Container name, this is the HOST to connect to in a Docker network
CONTAINER_NAME=rxpg-postgis-dev
# Container host name
CONTAINER_HOST_NAME=rxpg-postgis-dev
# The data dir can be a folder routed with $(pwd) or a name for a
# system-wide volume, or even drop it altogether for in-container data
PG_DATA_DIR=
# The version of PG to use
PG_DOCKER_TAG=feral_fennec
# Locale
LOCALE=en_US
# postgresql.conf config
POSTGRESQL_CONF=
# pg_hba.conf config
PG_HBA_CONF=





# ---

# Command string

if [ ! -z "${NETWORK}" ]; then NETWORK="--network=${NETWORK}" ; fi

if [ ! -z "${CONTAINER_NAME}" ]; then CONTAINER_NAME="--name=${CONTAINER_NAME}" ; fi

if [ ! -z "${PG_DATA_DIR}" ]; then PG_DATA_DIR="-v ${PG_DATA_DIR}:/data/" ; fi

if [ ! -z "${CONTAINER_HOST_NAME}" ]; then CONTAINER_HOST_NAME="--hostname=${CONTAINER_HOST_NAME}" ; fi

if [ ! -z "${POSTGRESQL_CONF}" ]; then POSTGRESQL_CONF="-v ${POSTGRESQL_CONF}:/default_confs/postgresql.conf" ; fi

if [ ! -z "${PG_HBA_CONF}" ]; then PG_HBA_CONF="-v ${PG_HBA_CONF}:/default_confs/pg_hba.conf" ; fi

if [ "$INTERACTIVE" = true ] ; then 

    INTERACTIVE="--rm -ti"

else

    INTERACTIVE="-d"

fi

eval    docker run $INTERACTIVE \
            $NETWORK \
            $CONTAINER_NAME \
            $CONTAINER_HOST_NAME \
            $PG_DATA_DIR \
            $POSTGRESQL_CONF \
            $PG_HBA_CONF \
            -e "LOCALE=${LOCALE}" \
            -p $PORT:5432 \
            --workdir /ext-src/ \
            malkab/postgis:$PG_DOCKER_TAG
