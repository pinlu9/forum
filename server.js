var express   = require('express'),
    PORT      = process.env.PORT || 5432,
    server    = express(),
    MONGOURI  = process.env.MONGOLAB_URI || "monogdb://localhost:27017",
    dbname    ="db_test",
    mongoose  = require("mongoose");


    server.get('/super-secret-test', function (req, res) {
      res.write("welcome to my amazing app");
      res.end();
    });
    
mongoose.connect(MONGOURI + "/" + dbname);
    server.listen(PORT, function() {
      console.log("SERVER IS UP ON PORT:", PORT);
    });
