const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/products", async (req,res)=>{
  const products = await db.all("SELECT * FROM products");
  res.json(products);
});

app.post("/api/products", async (req,res)=>{
  const {name, price, stock} = req.body;
  await db.run("INSERT INTO products (name, price, stock) VALUES (?,?,?)",[name,price,stock]);
  res.json({status:"ok"});
});

app.post("/api/login", async (req,res)=>{
  const {username,password}=req.body;
  const user=await db.get("SELECT * FROM users WHERE username=? AND password=?",[username,password]);
  if(!user) return res.status(401).json({error:"Invalid"});
  res.json({status:"ok"});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log("Backend running on "+PORT));
