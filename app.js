//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://praneeth:gurupoornima@cluster0.1aic6.mongodb.net/todolistDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your Todolist!"
});

const item2 = new Item({
  name: "Click the + button to add a new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, founditems) {
      if (founditems.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err)
            console.log(err);
          else {
            console.log("Successfully saved default items to the .DB");
            // mongoose.connection.close();
          }
        });
        res.redirect("/");
      }
      // console.log(founditems);
      else res.render("list", {listTitle: "Today",newListItems: founditems});
      // res.render("list", {listTitle: "Today",newListItems: founditems});
  });

});

app.get("/:customListName",function(req,res)
{
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList)
  {
    if(!err)
    {
      if(foundList)
      {
        if(foundList.items.length===0)
        {
          foundList.items=defaultItems;
          foundList.save();
          res.redirect("/"+customListName);
        }
        else res.render("list",{listTitle: foundList.name,newListItems: foundList.items});
      }
      else{
        // console.log("Doesn't Exist");
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
    }
  });
});

app.post("/", function(req, res) {
  const newitem = req.body.newItem;
  const listname = req.body.list;
  const item = new Item({
    name: newitem
  });
  if(listname==='Today')
  {
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({name:listname},function(err,foundList)
    {
      if(!err)
      {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listname);
      }
      else console.log(err);
    });
  }
});

app.post("/delete",function(req,res)
{
  const itemId= req.body.checkbox;
  const listName = req.body.listName;
  if(listName==='Today')
  {
    Item.findByIdAndRemove(itemId,function(err)
    {
      if(!err)
      {
        console.log("Successfully Deleted Checked Item");
        res.redirect("/");
      }
    });
  }
  else {
    List.findOneAndUpdate({name: listName},{$pull: {items:{_id:itemId}} },function(err,foundList)
    {
      if(err)
      console.log(err);
      else {
        res.redirect("/"+listName);
      }
    });
  }
});

// app.get("/work", function(req, res) {
//   res.render("list", {
//     listTitle: "Work List",
//     newListItems: workItems
//   });
// });
//
// app.get("/about", function(req, res) {
//   res.render("about");
// });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
