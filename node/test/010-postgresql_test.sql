/**

  Initializes the database for testing.

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

commit;
