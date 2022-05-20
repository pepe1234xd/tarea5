const express = require('express');
const { isEmpty } = require('lodash');
const router = express.Router();
const { accounts } = require('../../db/entities'); // The same as require('../db/entities/index.js')

router.get('/', async (req, res) => {
    try {
        const data = await accounts.all();
        res.send(data);
    } catch (error) {
        console.error(error);
        res.status(500).send(null);        
    }
});

router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await accounts.get(id);
        if (data) {
            res.status(200).send(data);
        } else {
            res.status(404).send(null);
        }            
    } catch (error) {
        console.error(error);
        res.status(500).send(null);
    }
});

router.post('/', async (req, res) => {
    const account = req.body;
    try {
        if (!isEmpty(account)) {
            const id = await accounts.insert(account);
            res.status(201).send(id);
        } else {
            res.status(204).send(null);
        }    
    } catch (error) {
        console.error(error);
        res.status(500).send(null);
    }
});

module.exports = router;