#!/bin/bash

# Version: 2021-07-19

# -----------------------------------------------------------------
#
# Stops and drop the compose.
#
# -----------------------------------------------------------------
#
# Downs a compose. With TIMEOUT=0 it is fulminated. Stops and removes
# containers, networks, and volumes, if specified.
#
# -----------------------------------------------------------------
# Check mlkctxt to check. If void, no check will be performed. If NOTNULL,
# any activated context will do, but will fail if no context was activated.
MATCH_MLKCTXT=
# Stop timeout, in seconds. Defaults to "0" (unquoted).
TIMEOUT=
# Compose file, defaults to the default docker-compose.yaml file in this folder.
COMPOSE_FILE=
# Project name, can be blank. Take into account that the folder name will be
# used, there can be name clashes.
PROJECT_NAME=rxpg
# Drop volumes. Defaults to "true" (unquoted).
REMOVE_VOLUMES=





# ---

# Check mlkctxt is present at the system
if command -v mlkctxt &> /dev/null ; then

  if ! mlkctxt -c $MATCH_MLKCTXT ; then exit 1 ; fi

fi

# Compose file
COMPOSE_FILE_F=
if [ ! -z "${COMPOSE_FILE}" ] ; then COMPOSE_FILE_F="-f ${COMPOSE_FILE}" ; fi

# Timeout
TIMEOUT_F=0
if [ ! -z "${TIMEOUT}" ] ; then TIMEOUT_F=$TIMEOUT ; fi

# Project name
PROJECT_NAME_F=
if [ ! -z "${PROJECT_NAME}" ] ; then PROJECT_NAME_F="-p ${PROJECT_NAME}" ; fi

# Remove volumes
REMOVE_VOLUMES_F="-v"
if [ "$REMOVE_VOLUMES" = false ] ; then REMOVE_VOLUMES_F= ; fi

# Final command
eval docker-compose $COMPOSE_FILE_F $PROJECT_NAME_F down -t $TIMEOUT_F $REMOVE_VOLUMES_F
