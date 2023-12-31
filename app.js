//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Ayo:ppass@cluster0.e94v3rk.mongodb.net/todolistDB")

const itemsSchema = {
  name: String
}

const Item = mongoose.model("item", itemsSchema)

const item1 = new Item ({
  name: "Welcome to your to do list"
})
const item2 = new Item ({
  name: "Hit the + button to add an item"
})
const item3 = new Item ({
  name: " <--- Hit this to delete an item"
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if (foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
  if (err) {
    console.log(err)
  } else {
    console.log("successfully saved the data to DB")
  }
})
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  
  })
  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, gottenItem){
      gottenItem.items.push(item);
      gottenItem.save();
      res.redirect("/" + listName);
    });
  }

})

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox
  const listName = req.body.listName
  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err){
        console.log("successfully deleted the item")
      }
      res.redirect("/");
    })
  } else {
    List.findOneAndUpdate({name: listName}, {$pull:{items:{_id: checkedItemId}}}, function(err, gottenItem){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }


})

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName)
  List.findOne({name: customListName}, function(err, gottenItem){
    if (gottenItem){
      res.render("list", {listTitle: gottenItem.name, newListItems: gottenItem.items});
    } else {
      const list = new List ({
        name: customListName,
        items: defaultItems
      });
      list.save()
      res.redirect("/" + customListName)
     
    }
  })


  
  
})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started successfully");
});
