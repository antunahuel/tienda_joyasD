import express from 'express';

import db from './dataBase/config.js';

const app = express()
app.listen(3000, () => console.log('Server listen port http://localhost:3000'));

const procesarDatos = (joya)=>{
  
  let objJoya = {
      id: joya.id,
      name: joya.name,
      model: joya.model,
      metal: joya.metal || 'N/A',
      category: joya.category,
      cadena: joya.cadena || 0,
      medida: joya.medida || 0,
      value: joya.value,
      stock: joya.stock,
    }

  return objJoya;
}

app.get('/api/v1/joyas', async (req, res) => {
  try {  

    let {order, offset, limit, fieldOrder} = req.query;

    order = order || "asc";
    limit = limit || 2;
    offset = offset || 0;
    fieldOrder = fieldOrder || "id";
    
    let orderingValues = ["asc","desc"];

    if(!orderingValues.includes(order.toLowerCase())){
      return res.status(400).json({
        msg:"ha ingresado una opción de ordenamiento no válida distinta a [asc, desc]"
      })
    };

    let fields = ["id", "name", "model", "metal", "category", "cadena", "medida", "value", "stock"];

    if(!fields.includes(fieldOrder.toLowerCase())){
      return res.status(400).json({
        msg:`Usted esta intentando ordenar por una campo que no existe, los campos validos son: [${fields.join(" - ")}]`
      });
    };


    if(offset){
      offset = Number(offset);
      if(isNaN(offset)|| offset < 0){
        return res.status(400).json({
          msg:"Debe ingresar un offset númerico y mayor o igual 0"
        });
      }
    };

    
    if(limit){
      limit = Number(limit);
      if(isNaN(limit) || limit < 1){
        return res.status(400).json({
          msg:"Debe ingresar un limit númerico y mayor o igual 1"
        });
      }
    };


    let consulta = {
      text:`SELECT id, name, value FROM joyas ORDER BY ${fieldOrder} ${order} offset $1 limit $2`,
       values:[offset, limit]
    }

    let results = await db.query(consulta);
    let joyas = results.rows;

    let offsetNext = offset + limit;
    let offsetPrevious = offset - limit;

    let previus;

    if(offsetPrevious < 0){
      offsetPrevious = 0;
    }else{
      previus = `http://localhost:3000/api/v1/joyas?offset=${offsetPrevious}&limit=${limit}`;
    }

    let next;

    if(results.rowCount > 0){
      next = `http://localhost:3000/api/v1/joyas?offset=${offsetNext}&limit=${limit}`;
    }
    
    joyas = joyas.map(joya =>{
      let objJoyas = {
        id: joya.id,
        name: joya.name,
        url: `http://localhost:3000/api/v1/joyas/${joya.id}`,
        value: joya.value
      };

      return objJoyas;
    });
    
    res.json({
      next,
      previus,
      results: joyas
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg:"Error al intentar acceder al registro de joyas"
    })
  }
});

//ENDPOINT CON RUTA DINÁMICA CON FILTRO ID // CAMPOS

app.get('/api/v1/joyas/:id', async (req, res) => {
  try {

    let {id}=req.params;
    //probando get desde navegador http://localhost:3000/api/v1/joyas/2?fields=id,name,model,metal,value
    let selectedFields = ["id", "name", "model", "metal", "category", "cadena", "medida", "value", "stock"];

    let { fields } = req.query;

    if(fields){
      selectedFields = fields.split(",");
    
    }

    let consulta = {
      text:`SELECT ${selectedFields.join(",")} FROM joyas WHERE id=$1`,
      values:[id]
    }

    let results = await db.query(consulta);
    if(results.rowCount == 0){
      return res.status(404).json({
        msg:`No se encuentra registro de joya con ${id}`
      })
    }
    let joya = results.rows[0];

    if(!joya)
    
    res.json({
      joya: joya
    });

  } catch (error) {
    console.log()
    res.status(500).json({
      msg: error.code ? error.message : "Error al intentar accder a categoría de joyas",
      hint:error.hint
    });
  }
});

// ENDPOINT FILTRO POR CATEGORÍA

app.get('/api/v1/joyas/categoria/:category', async (req, res) => {
  try {

    let {category}=req.params;

    let consulta = {
      text:'SELECT id, name, model, metal, category, cadena, medida, value, stock FROM joyas WHERE category ilike $1',
      values:[`%${category}%`]
    }

    let results = await db.query(consulta);
    let joyas = results.rows;

    joyas = joyas.map(joya => procesarDatos(joya));

    res.json({
      joyas: joyas
    });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg:"Error al intentar acceder a la categoria de joyas"
    })
  }
});


