#create the database
create database if not exists docs;

use docs;

#create the tables
create table if not exists page(id bigint(20) not null primary key, url varchar(400), count bigint(20) not null default 0, negcount bigint(20) not null default 0);
create table if not exists feedback(id bigint(20) not null primary key auto_increment, pageurl varchar(400) not null, pageid bigint(20) not null, error boolean not null default 0, moreinfo boolean not null default 0, comment varchar(1200), email varchar(200), constraint foreign key(pageid) references page(id));