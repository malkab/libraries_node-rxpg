This is a Rx PostgreSQL driver.

There are several **tmuxinator** profiles:

- **rxpg.yml:** for normal development;

- **rxpg_many_clients.yml:** to test with many clients.



## Short Version: Connections Configuration Logic

Use a **postgresql.conf** **max_connections** big enough to handle the **maxPoolSize** config of the pool, plus adding some additional connections for service and debugging.



## Understanding Connections and the Pool Size

There is a diagnose method at **RxPg** called **connectionReport()** that outputs all sort of data about the connection clients at the database, check it.

The **max_connections** parameter of the **postgresql.conf** is an absolute maximum for connections, trying to surpass it the pool will output a **too many clients already** error. Use the **maxPoolSize** to control the number of connections allowed by the pool.

The following query will output current connections:

```sql
select
  pid as process_id,
  usename as username,
  datname as database_name,
  client_addr as client_address,
  client_hostname as client_hostname,
  application_name,
  backend_start,
  state,
  state_change
from pg_stat_activity
where datname is not null;
```

**datname** is tested against null because there are some "connections" to a null database that are system artifacts and doesn't count against the **max_connections** limit.

Also, keep in mind that the pool handles gracefully queries in excess of available clients and queues then, so no need to implement any logic to handle "more queries than clients" situations.
