import pg from 'pg';

export default Options => new pg.Client(
    Object.assign({
        host: "aurora.vpc",
        user: "postgres",
        database: "misc",
    }, Options));
