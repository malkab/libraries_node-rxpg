#!/bin/bash

# Version: 2021-06-22

# -----------------------------------------------------------------
#
# psql client.
#
# -----------------------------------------------------------------
#
# Creates a volatile PostGIS container to either create an interactive psql
# session or run a SQL script with the same client.
#
# -----------------------------------------------------------------
# Check mlkctxt to check. If void, no check will be performed. If NOTNULL,
# any activated context will do, but will fail if no context was activated.
MATCH_MLKCTXT=
# PostgreSQL user UID and GID. Defaults to 1000/1000, the default postgres
# server user.
POSTGRESUSERID=
POSTGRESGROUPID=
# The network to connect to. Remember that when attaching to the network of an
# existing container (using container:name) the HOST is "localhost". Also the
# host network can be connected using just "host".
NETWORK=rxpg
# These two options are mutually exclusive. Use null at both for an interactive
# psql session. In case of passing a script, files must exist at a mounted
# volume at the VOLUMES section, referenced by a full path. By default, the
# script will be search at WORKDIR. For psql commands, escape "\" as in "\\\l".
SCRIPT=
COMMAND=
# Container identifier root. This is used for both the container name (adding an
# UID to avoid clashing) and the container host name (without UID). Incompatible
# with NETWORK container:name option. If blank, a Docker engine default name
# will be assigned to the container.
ID_ROOT=rxpg-dev-psql
# Unique? If true, no container with the same name can be created. Defaults to
# true.
UNIQUE=
# Work dir. Use $(pwd) paths. Defaults to /.
WORKDIR=/ext_src/
# The version of PG to use. Defaults to latest.
PG_DOCKER_TAG=holistic_hornet
# The host, defaults to localhost.
HOST=postgis
# The port, defaults to 5432.
PORT=
# The user, defaults to postgres.
USER=
# The pass, defaults to postgres.
PASS=
# The DB, defaults to postgres.
DB=
# Declare volumes, a line per volume, complete in source:destination form. No
# strings needed, $(pwd)/../data/:/ext_src/ works perfectly. Defaults to ().
VOLUMES=($(pwd)/../sql/:/ext_src/)
# Env vars. Use ENV_VAR_NAME_CONTAINER=ENV_VAR_NAME_HOST format. Defaults to ().
ENV_VARS=
# Output to files. This will run the script silently and output results and
# errors to $OUTPUT_FILES_results.txt and $OUTPUT_FILES_errors.txt to the
# WORKDIR. Use only if running with the SCRIPT or COMMAND options. If empty,
# outputs to console.
OUTPUT_FILES=





# ---

# Check mlkctxt is present at the system
if command -v mlkctxt &> /dev/null ; then

  if ! mlkctxt -c $MATCH_MLKCTXT ; then exit 1 ; fi

fi

# Manage identifier
if [ ! -z "${ID_ROOT}" ] ; then

  N="${ID_ROOT}"
  CONTAINER_HOST_NAME_F="--hostname ${N}"

  if [ "${UNIQUE}" = false ] ; then

    CONTAINER_NAME_F="--name ${N}_$(uuidgen)"

  else

    CONTAINER_NAME_F="--name ${N}"

  fi

fi

# Network
if [ ! -z "${NETWORK}" ]; then NETWORK="--network=${NETWORK}" ; fi

# Env vars
ENV_VARS_F=

if [ ! -z "${ENV_VARS}" ] ; then

  for E in "${ENV_VARS[@]}" ; do

    ARR_E=(${E//=/ })

    ENV_VARS_F="${ENV_VARS_F} -e \"${ARR_E[0]}=${ARR_E[1]}\" "

  done

fi

# Volumes
VOLUMES_F=

if [ ! -z "${VOLUMES}" ] ; then

  for E in "${VOLUMES[@]}" ; do

    VOLUMES_F="${VOLUMES_F} -v ${E} "

  done

fi

# Docker tag
PG_DOCKER_TAG_F=latest
if [ ! -z "${PG_DOCKER_TAG}" ] ; then PG_DOCKER_TAG_F=$PG_DOCKER_TAG ; fi

# Host
HOST_F=localhost
if [ ! -z "${HOST}" ] ; then HOST_F=$HOST ; fi

# Port
PORT_F=5432
if [ ! -z "${PORT}" ] ; then PORT_F=$PORT ; fi

# User
USER_F=postgres
if [ ! -z "${USER}" ] ; then USER_F=$USER ; fi

# Password
PASS_F=postgres
if [ ! -z "${PASS}" ] ; then PASS_F=$PASS ; fi

# DB
DB_F=postgres
if [ ! -z "${DB}" ] ; then DB_F=$DB ; fi

# Script
if [ ! -z "${SCRIPT}" ] ; then SCRIPT="-f ${SCRIPT}" ; fi

# Command
if [ ! -z "${COMMAND}" ] ; then COMMAND="-c \"${COMMAND}\"" ; fi

# Workdir
WORKDIR_F="--workdir /"
if [ ! -z "${WORKDIR}" ] ; then WORKDIR_F="--workdir ${WORKDIR}" ; fi

# UID
POSTGRESUSERID_F=1000
if [ ! -z "${POSTGRESUSERID}" ] ; then POSTGRESUSERID_F=$POSTGRESUSERID ; fi

# GID
POSTGRESGROUPID_F=1000
if [ ! -z "${POSTGRESGROUPID}" ] ; then POSTGRESGROUPID_F=$POSTGRESGROUPID ; fi

# Output files
OUTPUT_FILES_F=""

if [ ! -z "$OUTPUT_FILES" ] ; then

  OUTPUT_FILES_F=" 1>${OUTPUT_FILES}_out.txt 2>${OUTPUT_FILES}_error.txt"

else

  OUTPUT_FILES_F=""

fi

eval   docker run -ti --rm \
          $NETWORK \
          $CONTAINER_NAME_F \
          $CONTAINER_HOST_NAME_F \
          $VOLUMES_F \
          $ENV_VARS_F \
          $WORKDIR_F \
          -e \""POSTGRESUSERID=${POSTGRESUSERID_F}\"" \
          -e \""POSTGRESGROUPID=${POSTGRESGROUPID_F}\"" \
          -e \""PASS_F=${PASS_F}\"" \
          -e \""HOST_F=${HOST_F}\"" \
          -e \""PORT_F=${PORT_F}\"" \
          -e \""USER_F=${USER_F}\"" \
          -e \""DB_F=${DB_F}\"" \
          -e \""SCRIPT=${SCRIPT}\"" \
          -e \""COMMAND=${COMMAND}\"" \
          -e \""OUTPUT_FILES_F=${OUTPUT_FILES_F}\"" \
          --entrypoint /bin/bash \
          malkab/postgis:$PG_DOCKER_TAG_F \
          -c "run_psql.sh"
