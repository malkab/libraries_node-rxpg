import * as rx from "rxjs";



console.log(`

------------------------------

`);


import { RxPg } from "./lib/index";

const pg = new RxPg(
    "rxpg-postgis-dev",
    5432,
    "postgres",
    "postgres",
    "postgres",
    10
);

pg.redisError$.subscribe({

    next: (error) => console.log("Error: ", error),

    error: (error) => console.log("Error: ", error),

});

rx.concat(

    //pg.executeQuery$("create table pg(i integer);"),

    pg.executeQuery$("insert into pg values (10);"),

    pg.executeQuery$("insert into pg values (1);"),

    pg.executeQuery$("select * from pg;"),

    pg.executeParamQuery$("select * from pg where i=$1", [ 1 ])

).subscribe(

    results => console.log("Res", results),

    error => console.log("Error", error),

    () => {
        
        console.log("Complete");

        pg.close();

    }

);

