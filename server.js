
'use strict'
require('dotenv').config();
const PORT = process.env.PORT;
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodoverride = require('method-override');
// const { query } = require('express');
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);
app.set('view engine', 'ejs');
app.use(express.static('./public/'));
app.use(express.urlencoded({ extended: true }))
app.use(methodoverride('_method'));
////////////////////////////////////////////////////
////////////////////////////////////////////////////


//Page Method 
app.get ('/' ,indexHandler);  // To Render API 
app.post('/',testTwoHandler); // to addto mt db
app.get ('/data' , dataHandler); // to view what I added
app.get ('/details/:id',detailsHandler); // to view  deatils of each one
app.put('/details/:id' , detialsUpdateHandler); // to update 
app.delete('/details/:id',detailsDeleteHandler); // to delete spesific one




////Conect to database
client.connect().then(() => {
    app.listen(PORT,()=>console.log( `I'mWorking at port ${PORT}`))
});



////////////////////////////////////////////////////
////////////////ERROR FUNCTIOS //////////////////////
// app.use('*',notFoundHandler);
// app.use(errorHandler);

function notFoundHandler(request, response) {
    let err = 'NOT FOUND';
    response.status(404).render('error', {err: err});
}

function errorHandler(err, request, response, next) {
    response.status(500).render('error', {err: err});
    
}

///////////////////////////////////////////////////
//////////////////////////////////////////////////
function indexHandler (request,response){
    let url ='https://digimon-api.vercel.app/api/digimon';
    superagent.get(url).then (x =>{

        let data =x.body;
       
        response.render('index', {toto:data})
    })

}
///////////////////////////////////////////////////////////
function testTwoHandler (request,response){
    let name = request.body.one;
    let src = request.body.two;
    let level =request.body.three;
    let values =[name,src,level];
    let SQL ='INSERT INTO myCollection (name ,img,level) VALUES ($1 ,$2 ,$3 ) RETURNING *';
    client.query(SQL,values).then (y=>{
        response.redirect('/');
    })


}
//////////////////////////////////////////////////////////
function dataHandler (request,response){
let SQL ='SELECT * FROM myCollection';
client.query(SQL).then(x =>{
    response.render('mydata', {collection :x.rows})
})
}
////////////////////////////////////////////////////////
function detailsHandler(request ,response){
    let id =request.params.id ;
    let SQL =`SELECT * FROM myCollection WHERE id=$1`;
    client.query(SQL,[id]).then (y=>{
response.render('details',{ data :y.rows[0]})
    })
}
//////////////////////////////////////////////////////////

function detialsUpdateHandler (request,response){
    let name =request.body.name;
    let img =request.body.img;
    let level =request.body.level ;
    let id = request.body.id ;
    let values =[name,img,level,id];
    let SQL =`UPDATE myCollection SET name=$1 , img=$2 ,level=$3 WHERE id =$4 `;
    client.query(SQL,values).then (y=>{

        response.redirect(`/details/${id}`);
    })
}


function detailsDeleteHandler(request,response){

   
        let id = request.body.id;
        console.log(request.params.id);
        let SQL = 'DELETE FROM myCollection WHERE id=$1';
        client.query(SQL, [id]).then( x => {
            response.redirect('/')
        })
    }










