const express = require('express');
const router = express.Router();
const {database} = require('../config/helpers');

/* GET ALL ORDERS */
router.get('/', (req, res) =>{

    database.table('orders_details as od')
        .join([
            {
                table: 'orders as o',
                on: 'o.id = od.order_id'
            },
            {
                table: 'products as p',
                on: 'p.id = od.product_id'
            },
            {
                table: 'users as u',
                on: 'u.id = o.user_id'
            }
        ])
        .withFields(['o.id', 'p.title as name', 'p.description', 'p.price', 'u.username'])
        .sort({id: 1})
        .getAll()
        .then(orders => {
            if(orders.length > 0){
                res.status(200).json(orders);
            } else {
                res.json({message: 'No orders found.'});
            }
        }).catch(err =>console.log(err));


});

/* GET SINGLE ORDER */
router.get('/:id', (req, res) =>{
    const orderID = req.params.id;


    database.table('orders_details as od')
        .join([
            {
                table: 'orders as o',
                on: 'o.id = od.order_id'
            },
            {
                table: 'products as p',
                on: 'p.id = od.product_id'
            },
            {
                table: 'users as u',
                on: 'u.id = o.user_id'
            }
        ])
        .withFields(['o.id', 'p.title as name', 'p.description', 'p.price', 'u.username'])
        .filter({'o.id': orderID})
        .getAll()   //because there can be more products in one order
        .then(orders => {
            if(orders.length > 0){
                res.status(200).json(orders);
            } else {
                res.json({message: `No order found with ID ${orderID}.`});
            }
        }).catch(err =>console.log(err));

});

/* PLACE A NEW ORDER */
router.post('/new', (req, res) => {

    let {userID, products} = req.body;
    console.log(userID, products); //TODO: remove debug log

    if(userID != null && userID > 0 && !isNaN(userID)){
        database.table('orders')
            .insert({
                user_id: userID
            }).then(newOrderID =>{
                if(newOrderID > 0){
                    products.forEach(async (p) =>{

                        let data = await database.table('products')
                            .filter({id: p.id})
                            .withFields(['quantity'])
                            .get();

                        let inCart = p.incart;

                        //Subtract the number of pieces ordered from the quantity column in database
                        if(data.quantity > 0) {
                            data.quantity = data.quantity - inCart;
                            if(data.quantity < 0){
                                data.quantity = 0;
                            }
                        } else {
                            data.quantity = 0;
                        }

                        // INSERT ORDER DETAILS
                        database.table('orders_details')
                            .insert({
                                order_id: newOrderID,
                                product_id: p-id,
                                quantity: inCart
                            }).then(newID =>{
                                database.table('products')
                                    .filter({id: p.id})
                                    .update({
                                        quantity: data.quantity
                                    }).then(successNum =>{}).catch(err => console.log(err))

                        }).catch(err => console.log(err));
                    });
                } else {
                    res.json({message: 'new order failed while adding order details', success: false})
                }
                res.json({
                    message: `Order ${newOrderID} successfully placed.`,
                    success: true,
                    order_id: newOrderID,
                    products: products
                });
        }).catch(err => console.log(err));
    } else {
        res.json({message: 'New order failed.', success: false})
    }

});

/* FAKE PAYMENT GATEWAY CALL */
router.post('/payment', (req,res) => {
    setTimeout(() => {
        res.status(200).json({success:true});
    }, 3000)
});

module.exports = router;
