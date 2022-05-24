// Creation a datebase using pg-promise
// ORM object relational mapping
const pgp = require(`pg-promise`);
const camelize = require(`camelize`);

// convert all in camel case
function camelizeColumnNames(data) {
    if (data.length <= 0) return;
    var names = Object.keys(data[0]);
    var camels = names.map(n=> {
        return camelize(n);
    });
    data.forEach(d=> {
        names.forEach((n, i)=> {
            var c = camels[i];
            if (!(c in d)) {
                d[c] = d[n];
                delete d[n];
            }
        });
    });
}

// creation a datebase using pg-promise
const db = pgp({
    receive: camelizeColumnNames
})({
    host: 'localhost',
    user: 'postgres',
    password: 'Naturales13',
    database: 'management_db',
    port: 5432
});

module.exports = db;
