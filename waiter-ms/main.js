const express = require('express');
const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const recipePackageDefinition = protoLoader.loadSync(path.join(__dirname, '../protos/recipes.proto'), {});
const chefPackageDefinition = protoLoader.loadSync(path.join(__dirname, '../protos/kitchen.proto'), {});

const recipesProto = grpc.loadPackageDefinition(recipePackageDefinition);
const chefProto = grpc.loadPackageDefinition(chefPackageDefinition);

const recipesStub = new recipesProto.Recipes("0.0.0.0:8080", grpc.credentials.createInsecure());
const chefStub = new chefProto.Kitchen("0.0.0.0:8181", grpc.credentials.createInsecure());

const app = express();
app.use(express.json());

let restPort = 5000;
let orders = {};

function chefAsync(order) {
    recipesStub.find({id: order.productId}, (err, recipe) => {
        if(err) {
            console.error(err);
            return;
        }
        orders[order.id].recipe = recipe;
        const call = chefStub.chef({
            orderId: order.id,
            recipeId: recipe.id
        });
        call.on("data", (statusUpdate) => {
            orders[order.id].status = statusUpdate.status;
        });
    });
}

app.post('/orders', (req, res) => {
    if(!req.body.productId) {
        res.status(401).send("Invalid product identifier !!");
        return;
    }
    let orderId = Object.keys(orders).length + 1;
    let order = {
        id: orderId,
        status: 0,
        productId: req.body.productId,
        createdAt: new Date().toLocaleString()
    };
    orders[orderId] = order;
    chefAsync(order);
    res.send("new order successfully placed: \n"+ order);
});

app.get('/orders/:id', (req, res) => {
    if(!req.body.id || !orders[req.body.id]) {
        res.status(401).send("Invalid order Id !!");
        return;
    }
    res.send(orders[req.params.id]);
});

app.listen(restPort, () => console.log(`RESTful api is listening on port http://localhost:${restPort}`));