const express = require('express');
const multer = require('multer');
const path = require('path');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const {format} = require('timeago.js');

//iniacilización del servidor
const app = express();
require('./database.js');


//Configuraciones

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Middlewares

app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
const storage = multer.diskStorage({

    destination: path.join(__dirname, 'public/img/uploads'),
    filename: (req, file, cb, filename) => {
        cb(null, `image-${uuidv4()}${path.extname(file.originalname)}`)
    }


});
app.use(multer({

    storage:storage

}).single('image'));


//Variables globales

app.use((req, res, next) => {
    app.locals.format = format;
    next();

});

//rutas

app.use(require('./routes/index.js'));

//archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, ()=>{

    console.log(`servidor iniciado en puerto ${app.get('port')}`);

});