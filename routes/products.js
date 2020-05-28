const express = require('express');
const router = express.Router();
const {database} = require('../config/helpers.js');

/* GET ALL PRODUCTS. */
router.get('/', function(req, res) {
  let page = ( req.query.page != undefined && req.query.page != 0 ) ? req.query.page : 1; //set the current page
  const limit = (req.query.limit != undefined && req.query.limit != 0 ) ? req.query.limit : 12; //set the limit of items per page

  let startValue;
  let endValue;

  if(page > 0) {
    startValue = (page * limit) - limit; //calculate the startValue of the product on this page
    endValue = page * limit;
  } else {
    startValue = 0;
    endValue = limit;
  }

  database.table('products as p')
      .join([{
        table: 'categories as c',
        on: 'c.id = p.cat_id'
      }])
      .withFields([
          'c.title as category',
          'p.title as name',
          'p.price',
          'p.quantity',
          'p.image',
          'p.id'
      ])
      .slice(startValue, endValue)
      .sort({id: .1})
      .getAll()
      .then(prods => {
        if(prods.length > 0){
          res.status(200).json({
            count: prods
               .length,
            products: prods
          });
        } else {
          res.json({message: 'No products found!'});
        }
      }).catch(err => console.log(err));


});

/* SET SINGLE PRODUCT */
router.get('/:prodID', (req, res) =>{

    let productID = req.params.prodID; //fetch the parameter from the link
    console.log(productID); //TODO: remove debug log


    database.table('products as p')
        .join([{
            table: 'categories as c',
            on: 'c.id = p.cat_id'
        }])
        .withFields([
            'c.title as category',
            'p.title as name',
            'p.price',
            'p.quantity',
            'p.image',
            'p.images',
            'p.id'
        ])
        .filter({'p.id' : productID})
        .get()
        .then(prod => {
            if(prod){
                res.status(200).json(prod);
            } else {
                res.json({message: `No product found with ID ${productID} !`});
            }
        }).catch(err => console.log(err));

})

/* GET ALL PRODUCTS FROM A CATEGORY */
router.get('/category/:catName', (req, res) =>{

    let page = ( req.query.page != undefined && req.query.page != 0 ) ? req.query.page : 1; //set the current page
    const limit = (req.query.limit != undefined && req.query.limit != 0 ) ? req.query.limit : 12; //set the limit of items per page

    let startValue;
    let endValue;

    if(page > 0) {
        startValue = (page * limit) - limit; //calculate the startValue of the product on this page
        endValue = page * limit;
    } else {
        startValue = 0;
        endValue = limit;
    }

    const cat_title = req.params.catName; //fetch the category name from the URL

    database.table('products as p')
        .join([{
            table: 'categories as c',
            on: `c.id = p.cat_id WHERE c.title LIKE '%${cat_title}%'`
        }])
        .withFields([
            'c.title as category',
            'p.title as name',
            'p.price',
            'p.quantity',
            'p.image',
            'p.id'
        ])
        .slice(startValue, endValue)
        .sort({id: .1})
        .getAll()
        .then(prods => {
            if(prods.length > 0){
                res.status(200).json({
                    count: prods
                        .length,
                    products: prods
                });
            } else {
                res.json({message: `No products found in the category ${cat_title}!`});
            }
        }).catch(err => console.log(err));
});
module.exports = router;
