var express             = require ('express'),
    server              = express(),
    ejs                 = require('ejs'),
    bodyParser          = require('body-parser'),
    methodOverride      = require ('method-override'),
    mongoose            = require ('mongoose'),
    session             = require ('express-session'),
    expressEjsLayouts   = require('express-ejs-layouts'),
    PORT                = process.env.PORT || 5432,
    server              = express(),
    MONGOURI            = process.env.MONGOLAB_URI || "mongodb://localhost:27017",
    dbname              = "project2";

server.get('/test', function (req, res) {
  res.write("<h1>Welcome to my amazing app</h1>");
  res.end();
});

mongoose.connect(MONGOURI + "/" + dbname);


//below forum 2

//database + server

var db = mongoose.connection;


//set
server.set('views', './views');
server.set('view engine', 'ejs');

//use
server.use(session ({
  secret: "asdfghjklzxcvbnm",
  resave: true,
  saveUninitialized: false
}));

server.use(express.static("./public"));
server.use(expressEjsLayouts);

server.use(bodyParser.urlencoded({
  extended: true
}));

server.use(methodOverride('_method'));

server.use(function (req, res, next) { // ulimate logger
  console.log("--------------= [REQ START] =--------------");
  console.log("REQ DOT Body\n", req.body);
  console.log("REQ DOT Params\n", req.Params);
  console.log("REQ DOT session\n", req.session);
  console.log("--------------= [REQ START] =--------------");
  next();
});


//routes
var userController = require('./controllers/users.js');
server.use('/users', userController);

server.get('/welcome', function (req, res){
  if(req.session.currentUser) {
    res.render('welcome', {
      currentUser: req.session.currentUser

    });
  } else {
    res.redirect(301, '/users/');
  }

});





//to create or start a new thread in a new forum

var Thread = mongoose.model ("thread", {
  User: String,

  content: { type: String, maxlength: 200},
  comments: [ { author: String, content: String }],
  topic: { type: String, maxlength: 100},
  likes: [{ type: Number, default: 0 }]
});




// thread based on routes //

server.get('/threads', function (req, res) {
  Thread.find({}, function (err, allThreads) {
    if (err) {
      res.redirect(302, '/welcome');
        console.log(err);
    } else {
      res.render('threads/index', {
        currentUser: req.session.currentUser,
        threads: allThreads
      });
    }
  });
});

server.post('/threads', function (req, res) {
  var thread = new Thread({
    author: req.session.authorName,
    content: req.body.thread.content,
    topic: req.body.thread.topic,
    likes: req.body.thread.likes

  });

  thread.save(function (err, newThread) {
    if (err) {
      console.log("Thread rejected");
      res.redirect(302, '/threads/new');
        console.log(err);
    } else {
      console.log("New thread saved!");
      res.redirect(302, '/threads');
    }
  });
});

server.get('/threads/:id/show', function (req, res) {
  var threadID = req.params.id;

  Thread.findOne({
    _id: threadID
  }, function (err, foundThread) {

    // threads.push({
    //   _id: threadID
    // });
    if (err) {
      res.write("YOUR TOPIC ID IS BAD");
      res.end();
        console.log(err);
    } else {
      res.render('threads/show', {
        thread: foundThread
      });
    }
  });
});

server.get('/threads/:id/edit', function (req, res) {
  var threadID = req.params.id;

  Thread.findOne({
    _id: threadID
  }, function (err, foundThread) {
    if (err) {
      res.write("YOUR TOPIC ID IS BAD");
      res.end();
        console.log(err);
    } else {
      res.render('threads/edit', {
        thread: foundThread
      });
    }
  });
});

server.patch('/threads/:id', function (req, res) {
  var threadID = req.params.id;
  var threadParams = req.body.thread;

  Thread.findOne({
    _id: threadID
  }, function (err, foundThread) {
    if (err) {

    } else {
      foundThread.update(threadParams, function (errTwo, thread) {
        if (errTwo) {
          console.log("ERROR UPDATING");
            console.log(err);
        } else {
          console.log("UPDATED!");
          res.redirect(302, "/threads");
        }
      });
    }
  });
});

server.delete('/threads/:id', function (req, res) {
  var threadID = req.params.id;

  Thread.remove({
    _id: threadID
  }, function (err) {
    if (err) {

    } else {
      res.redirect(302, '/threads');
    }
  });
});

server.get('/threads/new', function (req, res) {
  res.render('threads/new');
});

server.get('/authors/:name', function (req, res) {
  var authorName = req.params.name;

  Thread.find({
    author: authorName
  }, function (err, authorThreads) {
    if (err) {
        console.log(err);

    } else {
      res.render('authors/threads', {
        author: authorName,
        threads: authorThreads
      });
    }
  });
});


//above forum

// catchall routes, as a last resort
server.use(function (req, res, next) {
res.send("Your Journey ends here.");
res.end();
});

server.listen(3000, function (){
  console.log("Server UP and RUNNING!");
});
