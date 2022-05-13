const TransanctionEntity = require('./transactions-entity');
const AccountEntity = require('./accounts-entity');

const accounts = new AccountEntity();
const transactions = new TransanctionEntity();

module.exports = {
    accounts,
    transactions
}