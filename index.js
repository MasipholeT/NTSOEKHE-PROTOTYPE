const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const cassandra=require("cassandra-driver");




app.use(bodyparser.urlencoded({extended: true}));
const keyspace = "ntsoekhe";
const datacenter ="datacenter1";

//remeber to always change this ip to match your machines ip
const contactPoints= ['192.168.112.213:9042'];
const client = new cassandra.Client({
contactPoints:contactPoints,
keyspace:keyspace,
localDataCenter:datacenter

});

let keep = 0;
app.use(express.static('public'));

app.get("/",function(req,res){
  res.render("index.ejs");
})

    app.post("/register",function(req,res){
      let userid =keep;
      keep = keep+1;

      var data = req.body;
      let name = data.firstname+" "+data.lastname;
      console.table(data);
      var query = "insert into userid(user_id,name,passwords,phone_number) values ("+userid+",'"+name+"','"+data.password+"',"+data.number+") ;";
      client.execute(query, function(error, result3){
        if(error){
          console.log("could not connect to db",error);    
        }
          else{
          }
          res.redirect("/login.html");
           })
    })

app.get("/update/:id/:hospital",function(req,res){
  res.render("notewrite.ejs",{
    param1:req.params.id,
    param2:req.params.hospital
    });
})


    app.post("/update/:id/:hospital",function(req,res){


      var data = req.body;
      console.table(data);
      let query= "update appointment set done='t' ,note='"+data.note+"' where appointment="+req.params.id+";";
      client.execute(query, function(error, result3){
        if(error){
          console.log("could not connect to db",error);    
        }
          else{
          }
          res.redirect("/aps/"+req.params.hospital);
           })
    })

    app.post("/login",function(req,res){
      var data = req.body;
      console.log(data.number,data.pass);
      
      try{
      let querie = "select * from userid where phone_number="+(data.number)+" and passwords= '"+data.pass+"' ALLOW FILTERING;";
      client.execute(querie, function(error, result){
        if(error){
          console.log("could not connect to db",error);
          res.redirect("/login.html");

        }
        else{
          console.table(result.rows);

          if(result.rows.length>0){

            res.redirect("/about/"+result.rows[0].name+"/"+result.rows[0].phone_number);
      
          }
          else{
        res.redirect("/login.html");

      
          }
          console.table(result.rows);
          
        }
      });
      }
      catch{
        res.redirect("/login.html");
      }
      })

      app.get("/about/:param1/:param2",function(req,res){
        res.render("about.ejs",{
        param1:req.params.param1,
        param2:req.params.param2
        }
        )
      })

      app.get("/appointment/:param1/:param2",function(req,res){
          res.render("appointment.ejs",{
            param1:req.params.param1,
            param2:req.params.param2
          })

      })

      app.post("/setap/:param1/:param2",function(req,res){

        let apid =keep;
        keep = keep+1;
        let name = req.params.param1;
        let number = req.params.param2;
        var data = req.body;
        console.table(data);
        var query = "insert into appointment(appointment,date,time,hospital,symptoms,name,number,done) values ("+apid+",'"+data.date+"','"+data.time+"','"+data.hospital+"','"+data.symptoms+"','"+name+"','"+number+"','f') ;";
        client.execute(query, function(error, result3){
          if(error){
            console.log("could not connect to db",error);    
          }
            else{
            }
            res.redirect("/about/"+name+"/"+number);
             })
        
      })

      app.post("/health",function(req,res){
        var data = req.body;
        console.log(data.number,data.pass);
        
        try{
        let querie = "select * from worker where phone_number="+(data.number)+" and passwords= '"+data.pass+"' ALLOW FILTERING;";
        client.execute(querie, function(error, result){
          if(error){
            console.log("could not connect to db",error);
            res.redirect("/login.html");
  
          }
          else{
            console.table(result.rows);
  
            if(result.rows.length>0){
  
              res.redirect("/aps/"+result.rows[0].hospital);
        
            }
            else{
          res.redirect("/login.html");
  
        
            }
            console.table(result.rows);
            
          }
        });
        }
        catch{
          res.redirect("/login.html");
        }
        })
      
        app.get("/aps/:hospital",function(req,res){

          let query = "select * from appointment where hospital='"+req.params.hospital+"' and done='f' ALLOW FILTERING";

  


           let array = [];
     
     
           client.execute(query, function(error, result3){
             if(error){
               console.log("could not connect to db",error);
     
             }
               else{
               try{
                     for(let i=0;i < result3.rows.length;i++){
                       array.push([result3.rows[i].appointment,result3.rows[i].name,result3.rows[i].symptoms,result3.rows[i].date,result3.rows[i].time],)
                     }
                     console.table(array);
                  }
                  catch{}
               }
  
             res.render("note.ejs",{
               paramname:req.params.hospital,
               array1:array
     
             })
             }
           );

     
        })

        






app.listen(3000,()=> console.log("nodejs is running on port 3000"));

