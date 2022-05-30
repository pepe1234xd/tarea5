const express = require('express');
const path = require('path');
const jwt = require("jsonwebtoken");

const app = express();
const v1 = require('./controllers/v1');
const port = 5001;

// JSON Middleware
app.use(express.json());

//Only swagger
const swagger = require(`swagger-ui-express`);
const swaggerdoc = require(`./swagger.json`);

// Static files
const folder = path.resolve(__dirname, 'public');
app.use('/', express.static(folder));

//adding a swagger documentation.
app.use(`/swagger`, swagger.serve);
app.use(`/swagger`, swagger.setup(swaggerdoc));

// Routers
app.use('/v1', v1);

//this is for send information and create a sing in using a secretkey and adding a expire in 1 minute
app.post("/login", (req , res) => {
  const user = {
      nombre : "Jose Alfredo",
      email: "joseafedox@gmail.com"
  }
  jwt.sign({user}, 'llavesecreta', {expiresIn: '1m'}, (err, token) => {
      res.json({
          token
      });
  });
});

//it is only for send the information using the token verify in postman
app.post("/login/posts", verifyToken, (req , res) => {
  jwt.verify(req.token, 'llavesecreta', (error, authData) => {
      if(error){
          res.sendStatus(403);
      }else{
          res.json({
                  mensaje: "Post as been created",
                  authData
              });
      }
  });
});

//in this part i check if the token exist and send a response with the command next()
// Authorization: Bearer <token>
function verifyToken(req, res, next){
   const bearerHeader =  req.headers['authorization'];
   if(typeof bearerHeader !== 'undefined'){
     //separe in two parts the string an use te second part, this part is only por the token the first par is for bearer
        const bearerToken = bearerHeader.split(" ")[1];
        req.token  = bearerToken;
        next();
   }else{
       res.sendStatus(403);
   }
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})