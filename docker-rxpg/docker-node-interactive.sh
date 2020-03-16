#!/bin/bash

# -----------------------------------------------------------------
#
# Runs an interactive Node session for development.
#
# -----------------------------------------------------------------
#
# Runs Node environment. Good for interactive use or 
# Node / Express programs.
#  
# -----------------------------------------------------------------

# Node image version
NODE_VERSION=v10.16.0
# Null for an interactive shell session
SCRIPT=
# The network to connect to. Remember that when attaching to the network
# of an existing container (using container:name) the HOST is
# "localhost"
NETWORK=container:rxpg-postgis-dev
# Jupyter mode: runs a Jupyter server with Javascript support if a 
# version with this capability is used
# Jupyter exports automatically the 8888 port
JUPYTER=false
# Container name
CONTAINER_NAME=rxpg-node-test
# Container host name
CONTAINER_HOST_NAME=
# A set of volumes in the form ("source:destination" "source:destination")
VOLUMES=(
  $(pwd)/../node/:$(pwd)/../node/
  ~/.npmrc:/root/.npmrc
)
# Volatile (-ti --rm)
VOLATILE=true
# Open ports in the form (external:internal external:internal)
PORTS=()
# Custom entrypoint
ENTRYPOINT=/bin/bash
# Custom workdir
WORKDIR=$(pwd)/../node/
# Use display for X11 host server?
X11=false





# ---

if [ ! -z "${SCRIPT}" ]; then COMMAND="-c \"node ${SCRIPT}\"" ; fi


if [ ! -z "${NETWORK}" ] ; then 

  NETWORK="--network=${NETWORK}"
  
fi


if [ "${X11}" = true ] ; then 

  X11="-e DISPLAY=host.docker.internal:0"

  # Prepare XQuartz server
  xhost + 127.0.0.1

else

  X11=

fi


if [ ! -z "${CONTAINER_NAME}" ] ; then 

  CONTAINER_NAME="--name=${CONTAINER_NAME}"
  
fi


if [ ! -z "${CONTAINER_HOST_NAME}" ] ; then

  CONTAINER_HOST_NAME="--hostname=${CONTAINER_HOST_NAME}"
  
fi


if [ ! -z "${ENTRYPOINT}" ] ; then 

  ENTRYPOINT="--entrypoint ${ENTRYPOINT}"
    
fi


if [ ! -z "${WORKDIR}" ] ; then 

  WORKDIR="--workdir ${WORKDIR}"

fi


VOLUMES_F=

if [ ! -z "${VOLUMES}" ] ; then

  for E in "${VOLUMES[@]}" ; do

    VOLUMES_F="${VOLUMES_F} -v ${E} "

  done

fi


PORTS_F=

if [ ! -z "${PORTS}" ] ; then

  for E in "${PORTS[@]}" ; do

    PORTS_F="${PORTS_F} -p ${E} "

  done

fi


if [ "$JUPYTER" = true ] ; then 

  COMMAND="-c \"jupyter notebook --ip 0.0.0.0 --allow-root\""
  PORTS_F="${PORTS_F} -p 8888:8888 "

fi


if [ "$VOLATILE" = true ] ; then

  DOCKER_COMMAND="docker run -ti --rm"

else

  DOCKER_COMMAND="docker run -ti"

fi


eval  $DOCKER_COMMAND \
        $NETWORK \
        $CONTAINER_NAME \
        $CONTAINER_HOST_NAME \
        $X11 \
        $VOLUMES_F \
        $PORTS_F \
        $ENTRYPOINT \
        $WORKDIR \
        malkab/nodejs-dev:$NODE_VERSION \
        $COMMAND
