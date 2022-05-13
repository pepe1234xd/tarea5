const express = require('express');
const v1 = express.Router();

const accounts = require('./accounts-controller');
const transactions = require('./transactions-controller');

v1.use('/accounts', accounts);
v1.use('/transactions', transactions);

module.exports = v1;