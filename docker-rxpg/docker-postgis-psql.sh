#!/bin/bash

# -----------------------------------------------------------------
#
# psql session into the testing PostGIS.
#
# -----------------------------------------------------------------
#
# Creates a volatile PostGIS container to either create an interactive
# psql session or run a SQL script with the same client.
#  
# -----------------------------------------------------------------

# The network to connect to. Remember that when attaching to the network
# of an existing container (using container:name) the HOST is
# "localhost"
NETWORK=container:rxpg-postgis-dev
# Null for an interactive psql session, use -f for launching files or -c
# for commands. Files must be relative to the mount point SRC_FOLDER
SCRIPT=
# Container name
CONTAINER_NAME=rxpg-testing-psql
# Container host name
CONTAINER_HOST_NAME=
# Work dir
WORKDIR=/ext-src/
# The version of Docker PG image to use
POSTGIS_DOCKER_TAG=feral_fennec
# The host
HOST=localhost
# The port
PORT=5432
# The user
USER=postgres
# The pass
PASS=postgres
# The DB
DB=postgres
# Declare volumes, a line per volume, complete in source:destination
# form. No strings needed, $(pwd)/../data/:/ext-src/ works perfectly
VOLUMES=(

  $(pwd):/ext-src/
    
)





# ---

if [ ! -z "${NETWORK}" ] ; then NETWORK="--network=${NETWORK}" ; fi


if [ ! -z "${CONTAINER_NAME}" ] ; then 

  CONTAINER_NAME="--name=${CONTAINER_NAME}"
  
fi


if [ ! -z "${CONTAINER_HOST_NAME}" ] ; then

  CONTAINER_HOST_NAME="--hostname=${CONTAINER_HOST_NAME}"
  
fi


VOLUMES_F=

if [ ! -z "${VOLUMES}" ] ; then

  for E in "${VOLUMES[@]}" ; do

    VOLUMES_F="${VOLUMES_F} -v ${E} "

  done

fi


if [ ! -z "${SCRIPT}" ] ; then

  SCRIPT="-f ${SCRIPT}"
  
fi


if [ ! -z "${WORKDIR}" ] ; then 

  WORKDIR="--workdir ${WORKDIR}"

fi


eval    docker run -ti --rm \
          $NETWORK \
          $CONTAINER_NAME \
          $CONTAINER_HOST_NAME \
          $VOLUMES_F \
          $WORKDIR \
          --entrypoint /bin/bash \
          malkab/postgis:$POSTGIS_DOCKER_TAG \
          -c "\"PGPASSWORD=${PASS} psql -h ${HOST} -p ${PORT} -U ${USER} ${DB} ${SCRIPT}\""
