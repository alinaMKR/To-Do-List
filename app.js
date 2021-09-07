//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-alina:121712@cluster0.fzx9i.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Create your first task"
});


const defaultItems = [item1];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if (err){
          console.log(err);
        }else{
          console.log("Successfully inserted items");
        }

      });
      res.redirect("/");
    } else{
      res.render("list", {listTitle: "To Do List", newListItems: foundItems});
    }

  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName==="To Do List"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }


});

app.post("/delete", function(req, res){
  const crossedItemId = req.body.checkedItem;
  const listName = req.body.list;

  if(listName==="To Do List"){
    Item.findByIdAndRemove(crossedItemId, function(err){
      if (err){
        console.log(err);
      }else{
        console.log("Successfully deleted an item");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: crossedItemId}}}, function(err, result){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }


})

app.get("/:customListName", function(req, res){

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, result){
    if (err){
      console.log(err);
    }else
    if(!result){
      const list = new List({
        name: customListName,
        items: defaultItems
      });

      list.save();
      res.redirect("/"+customListName);
    }else{
      res.render("list", {listTitle: result.name, newListItems: result.items})
    }
  })



});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port== null || port ==""){
  port =3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
