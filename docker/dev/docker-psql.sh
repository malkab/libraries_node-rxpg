#!/bin/bash

. ../env.env

docker run -ti --rm \
    --name $DEV_PSQL_CONTAINERNAME \
    --network container:$DEV_PG_CONTAINERNAME \
    -v $(pwd)/:/ext-src/ \
    --workdir /ext-src/ \
    --entrypoint /bin/bash \
    malkab/postgis:candid_candice \
    -c "PGPASSWORD=postgres psql -h db -p 5432 -U postgres postgres"
    