
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mysql = require('mysql');

var messages = {
  error: "",
  respuesta: {}
};

app.use(express.static('public'));


var cliente = mysql.createConnection({
'user' : 'root',
'password': '',
'host': 'localhost',
'port': 3306
});

cliente.query("USE test");

io.on('connection', function(socket) {
    
    console.log('Alguien se ha conectado con Sockets');
    ListarLibros();

    function ListarLibros(){
        cliente.query("select ID_LIBRO, NOMBRE, AUTOR, FECHA from libro", function(err2, rs, field){
            if(err2){
                cliente.end();
                messages.error = "error al listar libros";
                socket.emit("salida", messages);
                return;
            }
    
            messages.respuesta = rs;
            io.sockets.emit('salida', messages);
            //socket.emit("salida", messages);

        });
    }

    socket.on('almacenar', function(data) {
        
        let sql = "";

        if(data.id == 0)
            sql = "insert into libro ( NOMBRE, AUTOR, FECHA)  VALUES('" + data.nombre + "','" + data.autor + "', now() )";
        else
            sql = "update libro set NOMBRE = '" + data.nombre +"', AUTOR = '" + data.autor + "', FECHA = now() WHERE ID_LIBRO = " + data.id;        
        
        console.log(sql);
        cliente.query(sql, function(err){
            if(err){
                cliente.end();
                messages.error = "Error al almacenar libro";
                socket.emit("salida", messages);
                return;
            }

            ListarLibros();
        });
    });

    socket.on('editar', function(data) {
        
        let sql = "select nombre, autor FROM libro where ID_LIBRO = " + data.id;
        console.log(sql);
        cliente.query(sql, function(err, rs){
            if(err){
                cliente.end();
                messages.error = "Error al almacenar libro";
                socket.emit("salida", messages);
                return;
            }

            var data2 = {
                "data":{}
             }

            data2['data'] = {uno:rs[0].nombre, dos:  rs[0].autor};    
            console.log(data2);




            var book = [];
            book[0] = rs[0].nombre;
            book[1] = rs[0].autor;

            var libro = JSON.stringify(rs);
            console.log(libro);
            messages.respuesta = rs;
            socket.emit("libro", messages);
            console.log(rs);
        });
    });

        

    socket.on('borrar', function(data) {
        
        let sql = "delete from libro where ID_LIBRO = " + data.id;
        
        cliente.query(sql, function(err){
            if(err){
                cliente.end();
                messages.error = "Error al eliminar libro";
                socket.emit("salida", messages);
                return;
            }
            
            ListarLibros();
                
        });
    
        //enviar respuesta a todos los cleintes
        //io.sockets.emit('salida', messages);
    });

    /*
    socket.emit('messages', messages);
  
    socket.on('new-message', function(data) {
      messages.push(data);
  
      io.sockets.emit('messages', messages);
    });
    */
    
  });



server.listen(3000, function() {
    console.log("Servidor corriendo en http://localhost:3000");
 });

/*

var io = require('socket.io').listen(server);

io.sockets.on("connection", function(socket) {
cliente.query("SELECT id, desdep FROM departamentos", function(err, rs, field) {
    if (err) {cliente.end(); return;}
    socket.emit("departamentos", rs);
});

socket.on('provincias', function(data) {
    var id = data.id;

    cliente.query("SELECT id, despro FROM provincias WHERE departamento_id = ?", [id], function(err, rs, field) {
        if (err) {cliente.end(); return;}
        socket.emit("provincias", rs);
    });
});

socket.on('distritos', function(data) {
    var id = data.id;

    cliente.query("SELECT id, desdist FROM distritos WHERE provincia_id = ?", [id], function(err, rs, field) {
        if (err) {cliente.end(); return;}
        socket.emit("distritos", rs);
    });
});
});
*/

