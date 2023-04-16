const { Router } = require('express');
const router =  Router();
const { unlink } = require('fs-extra');
const path = require('path');

const Image = require('../models/image.js');

router.get('/', async (req, res) => {

    const images = await Image.find();
    res.render('index.ejs', {images: images})
});
router.get('/upload', (req, res) =>{

    res.render("upload.ejs");

})
router.post('/upload', async (req, res) => {

    if (!req.file) {
        return res.status(400).send('No se ha seleccionado ninguna imagen para cargar');
    }
      
    if (req.file.truncated) {
        return res.status(400).send('El archivo cargado es demasiado grande');
    }

    const image = new Image();
    image.title = req.body.title;
    image.description = req.body.description;
    image.filename = req.file.filename;
    image.path = '/img/uploads/' + req.file.filename;
    image.originalname = req.file.originalname;
    image.mimetype = req.file.mimetype;
    image.size = req.file.size;

    image.save();

    console.log(image);
    res.json({image});

});
router.get('/image/:id', async (req, res) => {

    const image = await Image.findById(req.params.id);
    console.log(image);
    res.render('profile.ejs', {image: image});

});
router.get('/image/:id/delete', async (req, res) => {
    const { id } = req.params;
    const imageDeleted = await Image.findByIdAndDelete(id);
    await unlink(path.resolve('./src/public' + imageDeleted.path));
    res.redirect('/');
});

module.exports = router;