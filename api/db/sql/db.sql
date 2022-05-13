CREATE DATABASE management_db;

CREATE TABLE accounts (
    account_id serial NOT NULL,
    name varchar(50) NOT NULL,
    PRIMARY KEY(account_id)
);

CREATE TABLE transactions (
    transaction_id serial NOT NULL,
    account_id integer NOT NULL,
    amount numeric(7,2) NOT NULL,
    date timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk__accounts FOREIGN KEY (account_id) REFERENCES accounts(account_id),
    PRIMARY KEY(transaction_id)
);