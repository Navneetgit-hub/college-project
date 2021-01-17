//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const _ = require("lodash");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://admin-nitin:Test123@navneetcluster0.dbgvx.mongodb.net/todo2DB", {useUnifiedTopology: true, useNewUrlParser: true});
mongoose.set("useCreateIndex", true);

const itemsSchema = {
  name: String
}

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Eating"
})
const item2 = new Item({
  name: "Coding"
})
const item3 = new Item({
  name: "Playing"
})

const defaultItems = [item1, item2, item3];

const listsSchema = {
  name: String,
  items: [itemsSchema]
}
const List = mongoose.model("list", listsSchema);

app.get("/", function(req, res) {
  Item.find({},function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Succesfully inserted the items");
        }
      })
      res.redirect("/");
    }else{
      res.render("todo", {listTitle: "Today", newListItems:foundItems});
    }
  });

});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newItem = new Item({
    name: itemName
  });
  if(listName === "Today"){
    newItem.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+ listName);
    });
  }

});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/contact", function(req, res){
  res.render("contact");
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Succesfully deleted checked item.");
        res.redirect("/");
      }
      });
      }else{
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
          if(!err){
            res.redirect("/" + listName);
          }
        });
  }

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(req, res){
  console.log("Server has started succesfully");
})
