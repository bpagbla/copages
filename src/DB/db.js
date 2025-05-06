const mysql = require('mysql2');  

console.log('db.js cargado');


const connection = mysql.createConnection({
  host: '127.0.0.1',
  port:3306,    
  user: 'root',         
  password: '',        
  database: 'pfcdb'    
});

// Verificar la conexión
connection.connect((err) => {
    if (err) {
      console.error('Error de conexión a la base de datos:', err);
      return;
    }
    console.log('Conexión exitosa a la base de datos');
  
    });

module.exports = connection; 
