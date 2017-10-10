var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var ImageRecognition = require('image-recognition');
var MongoStore = require('connect-mongo')(session);
var LocalStrategy = require('passport-local').Strategy;

var app = express();

//Make new databse
mongoose.connect("mongodb://test:test@ds151014.mlab.com:51014/safai");
mongoose.connect("mongodb://localhost/safai");
var db = mongoose.connection;
//If Mongo Error
db.on('error', console.error.bind(console, 'connection error'));

//Setting up sessions+cookies
app.use(session({
    secret: 'safai',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: db
    })
}));
app.use(passport.initialize());
app.use(passport.session());

var User = require('./models/user');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var Question = require('./models/question');

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

//Setting up body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Setting public directory
app.use(express.static(__dirname + '/public'));

//Setting view engine
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

//Setting routes
var routes = require('./routes/index');
app.use('/', routes);

//404
app.use((res, req, next) => {
  var err = new Error('File not found!');
  err.status = 404;
  next(err);
});

var net = new brain.NeuralNetwork();

net.train([{input: { r: 0.03, g: 0.7, b: 0.5 }, output: { black: 1 }},
           {input: { r: 0.16, g: 0.09, b: 0.2 }, output: { white: 1 }},
           {input: { r: 0.5, g: 0.5, b: 1.0 }, output: { white: 1 }}]);

var output = net.run({ r: 1, g: 0.4, b: 0 });  // { white: 0.99, black: 0.002 }

net.train(data, {
  errorThresh: 0.005,  // error threshold to reach
  iterations: 20000,   // maximum training iterations
  log: true,           // console.log() progress periodically
  logPeriod: 10,       // number of iterations between logging
  learningRate: 0.3    // learning rate
});

var json = net.toJSON();
net.fromJSON(json);

var run = net.toFunction();
var output = run({ r: 1, g: 0.4, b: 0 });
console.log(run.toString());

var net = new brain.NeuralNetwork({
  activation: 'sigmoid', // activation function
  hiddenLayers: [4],
  learningRate: 0.6 // global learning rate, useful when training using streams
});

// species a 2-layer neural network with one hidden layer of 20 neurons
var layer_defs = [];
layer_defs.push({type:'input', out_sx:1, out_sy:1, out_depth:2});
layer_defs.push({type:'fc', num_neurons:20, activation:'relu'});
layer_defs.push({type:'softmax', num_classes:10});

var net = new convnetjs.Net();
net.makeLayers(layer_defs);

// forward a random data point through the network
var x = new convnetjs.Vol([0.3, -0.5]);
var prob = net.forward(x); 

// prob is a Vol. Vols have a field .w that stores the raw data, and .dw that stores gradients
console.log('probability that x is class 0: ' + prob.w[0]); // prints 0.50101

var trainer = new convnetjs.SGDTrainer(net, {learning_rate:0.01, l2_decay:0.001});
trainer.train(x, 0); // train the network, specifying that x is class zero

var prob2 = net.forward(x);
console.log('probability that x is class 0: ' + prob2.w[0]);
// now prints 0.50374, slightly higher than previous 0.50101: the networks
// weights have been adjusted by the Trainer to give a higher probability to

var layer_defs = [];
layer_defs.push({type:'input', out_sx:32, out_sy:32, out_depth:3}); // declare size of input
// output Vol is of size 32x32x3 here
layer_defs.push({type:'conv', sx:5, filters:16, stride:1, pad:2, activation:'relu'});
// the layer will perform convolution with 16 kernels, each of size 5x5.
// the input will be padded with 2 pixels on all sides to make the output Vol of the same size
// output Vol will thus be 32x32x16 at this point
layer_defs.push({type:'pool', sx:2, stride:2});
// output Vol is of size 16x16x16 here
layer_defs.push({type:'conv', sx:5, filters:20, stride:1, pad:2, activation:'relu'});
// output Vol is of size 16x16x20 here
layer_defs.push({type:'pool', sx:2, stride:2});
// output Vol is of size 8x8x20 here
layer_defs.push({type:'conv', sx:5, filters:20, stride:1, pad:2, activation:'relu'});
// output Vol is of size 8x8x20 here
layer_defs.push({type:'pool', sx:2, stride:2});
// output Vol is of size 4x4x20 here
layer_defs.push({type:'softmax', num_classes:10});
// output Vol is of size 1x1x10 here

net = new convnetjs.Net();
net.makeLayers(layer_defs);

// helpful utility for converting images into Vols is included
var x = convnetjs.img_to_vol(document.getElementById('some_image'))
var output_probabilities_vol = net.forward(x)

//Error Handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    title: 'Error',
    message: err.message,
    error: {}
  });
});

//Listening
app.listen(process.env.PORT || 7000);
