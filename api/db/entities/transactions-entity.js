const db = require("../db");
const Entity = require("./entity");

class TransacationsEntity extends Entity {
    constructor() {
        const table = 'transactions';
        super(table, 'transaction_id');

        this.sum = async function (id) {
            const result = await db.one(`SELECT SUM(amount) FROM ${table} WHERE account_id = ${id};`);
            return result;
        }
    }
}

module.exports = TransacationsEntity;