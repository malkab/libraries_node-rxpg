/**

  Number of connections.

*/
SELECT sum(numbackends) FROM pg_stat_database;
