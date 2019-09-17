#!/bin/bash

# --------------------------------
#
# Creates an instance of PostgreSQL
#
# Creates the PostgreSQL test container
#  
# --------------------------------

# The PG server container name
POSTGIS_DB_CONTAINER_NAME=rxpg-postgis-dev
# The port to expose to the host
PORT=5432
# The data dir can be a folder routed with $(pwd) or a name for a
# system-wide volume
PG_DATA_DIR=
# The version of PG to use
PG_DOCKER_TAG=candid_candice
# The network to attach, if any
NETWORK=rxpg-network
# Locale
LOCALE=en_US
# The postgresql.conf configuration, if any
# This is a conservative config for a 4GB RAM and 2 CPU, HDD system, 50 connections (testing)
PG_CONF="max_connections=50#shared_buffers=1GB#effective_cache_size=3GB#maintenance_work_mem=256MB#checkpoint_completion_target=0.7#wal_buffers=16MB#default_statistics_target=100#random_page_cost=4#effective_io_concurrency=2#work_mem=104857kB#min_wal_size=1GB#max_wal_size=2GB#max_worker_processes=2#max_parallel_workers_per_gather=1#max_parallel_workers=2#max_wal_senders=5#max_locks_per_transaction=1024#listen_addresses='*'#dynamic_shared_memory_type=posix#log_timezone='UTC'#datestyle='iso, mdy'#timezone='UTC'#log_statement='all'#log_directory='pg_log'#log_filename='postgresql-%Y-%m-%d_%H%M%S.log'#logging_collector=on#client_min_messages=notice#log_min_messages=notice#log_line_prefix='%a %u %d %r %h %m %i %e'#log_destination='stderr,csvlog'#log_rotation_size=500MB#log_error_verbosity=default"



# Container run

if [ -z "${NETWORK}" ]; then

    docker run -d \
        --name $POSTGIS_DB_CONTAINER_NAME \
        -e "PG_CONF=${PG_CONF}" \
        -e "LOCALE=${LOCALE}" \
        -p $PORT:5432 \
        --workdir /ext-src/ \
        malkab/postgis:$PG_DOCKER_TAG

else

    docker run -d \
        --name $POSTGIS_DB_CONTAINER_NAME \
        -e "PG_CONF=${PG_CONF}" \
        -e "LOCALE=${LOCALE}" \
        -p $PORT:5432 \
        --workdir /ext-src/ \
        --network $NETWORK \
        malkab/postgis:$PG_DOCKER_TAG

fi
