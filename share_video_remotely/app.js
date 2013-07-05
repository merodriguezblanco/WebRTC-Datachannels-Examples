var express = require("express");
var app = express();

app.use('/public', express.static(__dirname + '/public'));

app.configure(function () {
  app.set("view engine", "ejs");
});

app.get("/sender", function (request, response) {
  response.render("sender");
});

app.get("/receiver", function (request, response) {
  response.render("receiver");
});

app.listen(9000);
console.log("Server listening on port 9000.");
