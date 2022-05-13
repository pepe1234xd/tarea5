window.onload = function (ev) {
    const app = App();
}

function App() {
    
    const formTransactions = FormTransactions();
    const formShow = FormShow();

    const select = Select();
    const selectShow = SelectShow();

    /** @type {HTMLButtonElement} */
    const saveButton = document.getElementById('transactions-form-save-button');
    saveButton.onclick = function (ev) {
        if (formTransactions.checkValidity()) {
            const inputs = formTransactions.querySelectorAll('input, select');
            const object = {};
            for (const input of inputs) {
                const value = input.value;
                const key = input.name;
                object[key] = value; // Object.defineProperty(object, key, { value: value })            
            }
            TransactionsService.save(object);
        } else {
            form.reportValidity();
        }
    }

    /** @type {HTMLButtonElement} */
    const withdrawButton = document.getElementById('transactions-form-withdraw-button');    
    withdrawButton.onclick = function (ev) {
        if (formTransactions.checkValidity()) {
            const inputs = formTransactions.querySelectorAll('input, select');
            const object = {};
            for (const input of inputs) {
                let value = input.value*-1;
                const key = input.name;
                if(key == `account_id`){
                    value = input.value;
                }
                object[key] = value; // Object.defineProperty(object, key, { value: value })            
            }
            
            TransactionsService.save(object);
        } else {
            formTransactions.reportValidity();
        }
    }

    /** @type {HTMLButtonElement} */
    const showButton = document.getElementById('show-form-button');
    showButton.onclick = function (ev) {
        const inputs = formShow.querySelectorAll('select');
        const object = {};
        for (const input of inputs) {
            let value = input.value;
            const key = input.name;
            object[key] = value; // Object.defineProperty(object, key, { value: value })            
        }

        TransactionsService.sum(object);
    }


}

function SelectShow(){
    /** @type {HTMLSelectElement} */
    const select = document.getElementById('transactions-form-accounts-show');

    const populate = async function () {
        const accounts = await AccountsService.all();
        select.innerHTML = '';
        for (const account of accounts) {
            const option = document.createElement('option');
            option.value = account.account_id;
            option.innerText = account.name;
            select.appendChild(option);
        }
    }
    populate();

    return select;
}

function Select() {
    /** @type {HTMLSelectElement} */
    const select = document.getElementById('transactions-form-accounts');

    const populate = async function () {
        const accounts = await AccountsService.all();
        select.innerHTML = '';
        for (const account of accounts) {
            const option = document.createElement('option');
            option.value = account.account_id;
            option.innerText = account.name;
            select.appendChild(option);
        }
    }
    populate();

    return select;
}

function FormTransactions() {
    /** @type {HTMLFormElement} */
    const forms = document.getElementById('transactions-form');
    return forms;
}
function FormShow() {
    /** @type {HTMLFormElement} */
    const forms = document.getElementById('show-form');
    return forms;
}

class TransactionsService {
    static baseUrl = 'http://localhost:5001/v1/transactions';

    static async save(transaction) {
        await fetch(TransactionsService.baseUrl, {
            method: 'POST',
            headers: {
                'Encondig': 'UTF-8',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transaction)
        })
    }
    static async sum() {
        const response = await fetch(TransactionsService.baseUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
        })
        switch (response.status) {
            case 200:
                return await response.json();        
            default:
                throw Error('Server Error');
        }
    }
}

class AccountsService {
    static baseUrl = 'http://localhost:5001/v1/accounts';

    static async all() {
        const response = await fetch(AccountsService.baseUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
        })
        switch (response.status) {
            case 200:
                return await response.json();        
            default:
                throw Error('Server Error');
        }
    }
}
