/**

  Initializes the database for testing. KEEP IT HERE SINCE IT IS USED BY THE
  CLEAR DATABASE ACTION IN TESTS.

*/
begin;

/**

  This table is for testing the foreign key error

*/
drop table if exists dependency cascade;

create table dependency(
  c integer primary key
);

insert into dependency values(1);
insert into dependency values(2);

drop table if exists singlekeyobjects;

create table singlekeyobjects(
  a integer primary key,
  b varchar,
  c integer references dependency(c)
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

drop table if exists test_null_undefined;

create table test_null_undefined(
  null_integer integer,
  null_varchar varchar,
  undefined_integer integer,
  undefined_varchar varchar,
  boolean_true boolean,
  boolean_false boolean,
  zero integer
);

commit;
