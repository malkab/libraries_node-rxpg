/**

  Initializes the database for testing.

*/
begin;

drop table if exists singlekeyobjects;

create table singlekeyobjects(
  a integer primary key,
  b varchar,
  c integer
);

drop table if exists dualkeyobjects;

create table dualkeyobjects(
  a integer,
  b integer,
  c varchar
);

alter table dualkeyobjects
add constraint dualkeyobject_pkey
primary key(a, b);

commit;
