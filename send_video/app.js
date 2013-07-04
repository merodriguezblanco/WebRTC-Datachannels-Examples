var express = require("express");
var app = express();

app.use('/public', express.static(__dirname + '/public'));
app.set("view engine", "ejs");

app.get("/", function (request, response) {
  response.render("index");
});

app.listen(9000);
console.log("Server listening on port 9000.");
