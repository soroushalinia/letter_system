const express = require("express")
const app = express()

app.post('post',(req,res)=>{
    const username = req.body
    console.log(username)
})

app.listen(5060, () => {
    console.log(`Server is running on http://localhost:5060`);
  });
  