const db = require("../db");
const Entity = require("./entity");

class TransacationsEntity extends Entity {
    constructor() {
        const table = 'transactions';
        super(table, 'transaction_id');

        this.sum = async function (id) {
            const result = await db.query(`SELECT SUM(amount) FROM ${table} WHERE ${id} = account_id;`);
            return result.rows[0];
        }
    }
}

module.exports = TransacationsEntity;