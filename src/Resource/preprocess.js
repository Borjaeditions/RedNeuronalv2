const {createCanvas, loadImage, ImageData} = require('canvas');
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require('uuid');
const Jimp = require('jimp');

const tf = require('@tensorflow/tfjs');

function imageRoute(route, filename) {
    console.log(route);
    route = path.join(__dirname, route);
    route = route.replace(/\\/g, '/');
    console.log(route);
    console.log("Esta debe ser la ruta: " + route);
    console.log("Hasta ahora, todo bien");
    imageLoaded(route, filename);
    /*loadImage(route).then((image) => {
        console.log("Esto debe ser la ruta bien hecha" + route);
    }).catch(err => {
        console.log('Error fatal', err);
    })*/
}
function imageLoaded(route, filename){

    var canvas = createCanvas(1200 , 1200);
    var ctx = canvas.getContext("2d");
    console.log(__dirname);
    console.log("debería haber llegado hasta aquí: " + route)
    loadImage(route).then((image) => {
        // Carga la imagen desde una ruta en disco
        ctx.drawImage(image, 0, 0, 1200, 1200); // Dibuja la imagen en el canvas, con un ancho y alto de 200px
        //console.log(canvas.toDataURL()); // Devuelve la imagen en formato base64

        //extraer tamaño de imagen y mantener mismas proporciones
        canvas.width = image.width;
        canvas.height = image.height;   
        
    //Dibujar imagen en canvas
    ctx.drawImage(image, 0, 0, image.width, image.height);
  
    var resultado = canvas;
    //pasar el objeto de tipo imagen a función blancoYNegro
    blancoYNegro(canvas);
    
    //visualizar imagen en documento html
    //var resultado = document.getElementById("Resultado");
    convolucionar(canvas, resultado, filename);
    });
}
function blancoYNegro(canvas){

    //tomar imagen y contexto
    var ctx = canvas.getContext("2d");
    var imgData = ctx.getImageData(0,0, canvas.width, canvas.height);
    var pixeles = imgData.data;
    console.log(imgData.data);

    //Recorrer cada uno de los pixeles de la imagen
    //obtenido en el arreglo de imgData.data
    for (var p = 0; p < pixeles.length; p += 4) {
        
        //separar en pixeles de color, obteniendo un promedio
        //de los 3 colores para obtener un promedio en gris
        var rojo = pixeles[p];
        var verde = pixeles[p+1];
        var azul = pixeles[p+2];
        var alpha = pixeles[p+3];

        var gris = (rojo + verde + azul)/3;
        
        pixeles[p] = gris;
        pixeles[p+1] = gris;
        pixeles[p+2] = gris;
        
    }
    
    ctx.putImageData(imgData, 0, 0);

}
function convolucionar(canvasFuente, canvasDestino, filename) {
    //obtener las variables necesarias
    var ctxFuente = canvasFuente.getContext("2d");
    var imgDataFuente = ctxFuente.getImageData(0,0, canvasFuente.width, canvasFuente.height);
    var pixelesFuente = imgDataFuente.data;    
    //asegurarse de que el canvasFuente y canvasFestino tengan el mismo tamaño
    canvasDestino.width = canvasFuente.width;
    canvasDestino.height = canvasFuente.height;

    var ctxDestino = canvasDestino.getContext("2d");
    var imgDataDestino = ctxDestino.getImageData(0,0, canvasDestino.width, canvasDestino.height);
    var pixelesDestino = imgDataDestino.data;

    
    //Nucleo, Kernel,
    /*
    var Kernel = [

        [-1,-1,-1],
        [-1, 8,-1],
        [-1,-1,-1],
        
        //[0,0,0],
        //[0,0,0],
        //[0, 1,0],

        //[1,0,-1],
        //[0, 0,0],
        //[-1,0,1],

    ];*/
    var sobelVertical = [

        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1],

    ];
    var sobelHorizontal = [

        [-1, -2,-1],
        [ 0, 0, 0], 
        [ 1, 2, 1],

    ];

    for(var y=1; y < canvasFuente.height-1; y++){

        for(var x=1; x < canvasFuente.width-1; x++){

            //posición en el arreglo de javascript
            var idx = ((y*canvasFuente.width) + x) *4;

            //Reducción de código
            /*
            var totalY = 0
            var totalX = 0

            for(var KernelY = 0; KernelY <3; KernelY++){
                for(var KernelX = 0; KernelX <3; KernelX++){

                    totalY += sobelVertical[KernelY][KernelX] * pixelesFuente[((((y + (KernelY-1))*canvasFuente.width) + (x + (KernelX-1))) * 4)];

                    totalX += sobelHorizontal[KernelY][KernelX] * pixelesFuente[((((y + (KernelY-1))*canvasFuente.width) + (x + (KernelX-1))) * 4)];

                }             
            }*/

            //Primer casilla
            
            //Kernel Regular
            /*
            var casilla1 = Kernel[0][0] * pixelesFuente[((((y-1)*canvasFuente.width) + (x-1)) * 4)];
            var casilla2 = Kernel[0][1] * pixelesFuente[((((y-1)*canvasFuente.width) + (x)) * 4)];
            var casilla3 = Kernel[0][2] * pixelesFuente[((((y-1)*canvasFuente.width) + (x+1)) * 4)];
            var casilla4 = Kernel[1][0] * pixelesFuente[((((y)*canvasFuente.width) + (x-1)) * 4)];
            var casilla5 = Kernel[1][1] * pixelesFuente[((((y)*canvasFuente.width) + (x)) * 4)];
            var casilla6 = Kernel[1][2] * pixelesFuente[((((y)*canvasFuente.width) + (x+1)) * 4)];
            var casilla7 = Kernel[2][0] * pixelesFuente[((((y+1)*canvasFuente.width) + (x-1)) * 4)];
            var casilla8 = Kernel[2][1] * pixelesFuente[((((y+1)*canvasFuente.width) + (x)) * 4)];
            var casilla9 = Kernel[2][2] * pixelesFuente[((((y+1)*canvasFuente.width) + (x+1)) * 4)];

            var resultado = casilla1 + casilla2 + casilla3 + casilla4 + casilla5 + casilla6 + casilla7 + casilla8 + casilla9;

            //asignar todos los pixeles
        
            pixelesDestino[idx] = resultado; //rojo
            pixelesDestino[idx+1] = resultado; //verde
            pixelesDestino[idx+2] = resultado; //azul
            pixelesDestino[idx+3] = 255; //alpha
            */
            //Convolución con sobel
            //Eje Y
            var casillaY1 = sobelVertical[0][0] * pixelesFuente[((((y-1)*canvasFuente.width) + (x-1)) * 4)];
            var casillaY2 = sobelVertical[0][1] * pixelesFuente[((((y-1)*canvasFuente.width) + (x)) * 4)];
            var casillaY3 = sobelVertical[0][2] * pixelesFuente[((((y-1)*canvasFuente.width) + (x+1)) * 4)];
            var casillaY4 = sobelVertical[1][0] * pixelesFuente[((((y)*canvasFuente.width) + (x-1)) * 4)];
            var casillaY5 = sobelVertical[1][1] * pixelesFuente[((((y)*canvasFuente.width) + (x)) * 4)];
            var casillaY6 = sobelVertical[1][2] * pixelesFuente[((((y)*canvasFuente.width) + (x+1)) * 4)];
            var casillaY7 = sobelVertical[2][0] * pixelesFuente[((((y+1)*canvasFuente.width) + (x-1)) * 4)];
            var casillaY8 = sobelVertical[2][1] * pixelesFuente[((((y+1)*canvasFuente.width) + (x)) * 4)];
            var casillaY9 = sobelVertical[2][2] * pixelesFuente[((((y+1)*canvasFuente.width) + (x+1)) * 4)];
            
            var resultadoY = casillaY1 + casillaY2 + casillaY3 + casillaY4 + casillaY5 + casillaY6 + casillaY7 + casillaY8 + casillaY9;

            //Eje X
            var casillaX1 = sobelHorizontal[0][0] * pixelesFuente[((((y-1)*canvasFuente.width) + (x-1)) * 4)];
            var casillaX2 = sobelHorizontal[0][1] * pixelesFuente[((((y-1)*canvasFuente.width) + (x)) * 4)];
            var casillaX3 = sobelHorizontal[0][2] * pixelesFuente[((((y-1)*canvasFuente.width) + (x+1)) * 4)];
            var casillaX4 = sobelHorizontal[1][0] * pixelesFuente[((((y)*canvasFuente.width) + (x-1)) * 4)];
            var casillaX5 = sobelHorizontal[1][1] * pixelesFuente[((((y)*canvasFuente.width) + (x)) * 4)];
            var casillaX6 = sobelHorizontal[1][2] * pixelesFuente[((((y)*canvasFuente.width) + (x+1)) * 4)];
            var casillaX7 = sobelHorizontal[2][0] * pixelesFuente[((((y+1)*canvasFuente.width) + (x-1)) * 4)];
            var casillaX8 = sobelHorizontal[2][1] * pixelesFuente[((((y+1)*canvasFuente.width) + (x)) * 4)];
            var casillaX9 = sobelHorizontal[2][2] * pixelesFuente[((((y+1)*canvasFuente.width) + (x+1)) * 4)];
            
            var resultadoX = casillaX1 + casillaX2 + casillaX3 + casillaX4 + casillaX5 + casillaX6 + casillaX7 + casillaX8 + casillaX9;

            //Teorema de pitágoras para tener los dos ejes en un sólo
            var mag = Math.sqrt(Math.pow(resultadoX, 2) + Math.pow(resultadoY, 2));
            //Eliminación de ruido
            mag = (mag < 80) ? 0 : mag;

            pixelesDestino[idx] = mag; //rojo
            pixelesDestino[idx+1] = mag; //verde
            pixelesDestino[idx+2] = mag; //azul
            pixelesDestino[idx+3] = 255; //alpha
        }

    }

    var finalWidth = canvasDestino.width;
    var finalHeight = canvasDestino.height;

    console.log(finalWidth + finalHeight);
    const canvas2 = createCanvas(finalWidth, finalHeight); // El tamaño del canvas se define con los valores de finalWidth y finalHeight
    console.log(canvas2); // No es necesario concatenar el objeto canvas con una cadena de texto
    console.log(finalWidth, finalHeight);

    const ctx = canvas2.getContext('2d');

    const imageData = new ImageData(imgDataDestino.data, finalWidth, finalHeight);
    ctx.putImageData(imageData, 0, 0);

    const filenamefinal = "bordes-sobel-" + filename;

    saveImage(canvas2, filenamefinal);
    runModel(filenamefinal);


}
async function saveImage(canvas, filename) {
    const outputDir = path.join(__dirname, 'images');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    const outputFilename = path.join(outputDir, filename);
    const out = fs.createWriteStream(outputFilename);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    await new Promise(resolve => out.on('finish', resolve));
    console.log(`Image saved to ${outputFilename}`);
    await compressImage(`${outputFilename}`, filename);
}

async function compressImage(route, outputFilename){
    try {
        const image = await Jimp.read(route);
        //const finalimagesize = outputFilename;
        await image.resize(28, 28).writeAsync(`src/Resource/images/compress/${outputFilename}`);
        console.log(`Imagen comprimida guardada en images/compress/${outputFilename}`);
    } catch (err) {
        console.error(err);
    }
}

//Llamar al modelo de la red neuronal convolucional

async function loadImageTF(imagePathCompress) {
    console.log(path.join(__dirname, 'images/compress/' + imagePathCompress));
    routeCompress = path.join(__dirname, 'images/compress/' + imagePathCompress);
    routeCompress = routeCompress.replace(/\\/g, '/');
    const imageBuffer = fs.readFileSync(routeCompress);
    const decodedImage = tf.node.decodeImage(imageBuffer);
    const reshapedImage = decodedImage.expandDims(0);
    return reshapedImage;
  }
  
  async function runModel(imagePathModel) {
    console.log(path.join(__dirname, 'brain/model.json'));
    const model = await tf.loadLayersModel(`http://127.0.0.1    /brain/model.json`);
    const image = await loadImageTF(imagePathModel);
    const prediction = model.predict(image);
    console.log(prediction.toString());
  }

module.exports = imageRoute;