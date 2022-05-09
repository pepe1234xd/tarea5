const pool = require(`../api/db/db.js`);


const addNewAmount = async () =>{

    //ingresa aqui el valor a añadir
    let value = 0;
    const b= await pool.query(`INSERT INTO management(amount) VALUES (${value})`);
}
addNewAmount();

const showamount = async () =>{

    const show= await pool.query(`SELECT SUM(amount) FROM management`);
    console.log(show.rows);
}
showamount();
const showdata = async () =>{

    const show2= await pool.query(`SELECT * FROM management`);
    console.log(show2.rows);
}
showdata();