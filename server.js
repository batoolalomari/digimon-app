'use stricit'

let superagent=require('superagent');
let pg=require('pg');
let express=require('express');
let cors=require('cors');
let methodOverride=require('method-override');



let app=express();
app.use(cors());
require('pg').config();

let DATABASE_URL=process.env.DATABASE_URL;
let PORT=process.env.PORT;

let client =pg(new Client(DATABASE_URL));


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');


// Routs 

app.get('/home',handelHome)
app.post('/digimon',addToDataBase)
app.get('/digimon',viewFavDigimon)

app.get('/digimon/:id',viewFavDigimonDetails)

app.put('/digimon/:id',updateFavDigimonDetails)
app.delete('/digimon/:id',deleteFavDigimonDetails)


// functions
function Digimons(obj) {
    this.name=obj.name;
    this.img=obj.img;
    this.level=obj.level;
    
}


function handelHome(req,res) {

   let url= 'https://digimon-api.herokuapp.com/api/digimon';
   let arr=[];
   superagent.get(url).then(data=>{
       data.body.forEach(result=>{
           arr.push(new Digimons(result));
       })

       res.render('home',{data:arr});

   }).catch(err=>{
       console.log('eroorr...'+err);
   })
}

 function addToDataBase(req,res) {
     let query='INSERT INTO digimon (img,name,level) VALUES ($1,$2,$3);';
     let values=[req.body.img,req.body.name,req.body.level];

     client.query(query,values).then(data=>{
         res.redirect('/digimon');
     }).catch(err=>{
        console.log('eroorr...'+err);
    })
     
 }  

 function viewFavDigimon(req,res) {

     let query='SELECT * FROM digimon;';
         client.query(query).then(data=>{
         res.render('/favorite',{data:data.rows});
     }).catch(err=>{
        console.log('eroorr...'+err);
    })
 }

 function viewFavDigimonDetails(req,res) {

     let query='SELECT * FROM digimon (img,name,level) VALUES ($1,$2,$3) WHERE id=$4;';
     let values=[req.body.img,req.body.name,req.body.level,req.params.id];

     client.query(query,values).then(data=>{
         res.render('/details',{data:data.rows[0]});
     }).catch(err=>{
        console.log('eroorr...'+err);
    })
 }

 function updateFavDigimonDetails(obj) {
    let query='UPDATE digimon SET name=$1 , level=$2 WHERE id=$3;';
    let values=[req.body.name,req.body.level,req.params.id];

    client.query(query,values).then(data=>{
        res.redirect('/digimon');
    }).catch(err=>{
       console.log('eroorr...'+err);
   })
     
 }

 function deleteFavDigimonDetails(req,res) {

    let query='DELETE FROM digimon  WHERE id=$1;';
    let values=[req.params.id];

    client.query(query,values).then(data=>{
        res.redirect('/digimon');
    }).catch(err=>{
       console.log('eroorr...'+err);
   })
     
 }

client.connect().then(data=>{
    app.listen(PORT=>{
          console.log('app listineeng in port'+PORT);
    })
}).catch(err=>{
    console.log('eroorr...'+err);
})