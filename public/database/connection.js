let sql = require('mysql');
let connection = sql.createConnection({
    host: "localhost",
    user: "root",
    password: null,
    database: "airbnb"
});
connection.connect((error)=>{
    if(error){
        console.log(error);
    }else{
        console.log("Connected");
    }
})
module.exports = connection;