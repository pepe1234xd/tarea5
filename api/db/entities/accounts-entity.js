const Entity = require('./entity');

function AccountsEntity() {
    Entity.call(this, 'accounts', 'account_id');
}

// Making it inherit from entity
AccountsEntity.prototype = Entity;
AccountsEntity.prototype.constructor = AccountsEntity;

module.exports = AccountsEntity;