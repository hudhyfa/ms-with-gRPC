const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync(path.join(__dirname, '../protos/recipes.proto'), {});
const recipesProto = grpc.loadPackageDefinition(packageDefinition);
const RECIPES = require('./recipes');

const server = new grpc.Server();
server.addService(recipesProto.Recipes.service, {
    Find: findRecipe
})
server.bindAsync("0.0.0.0:8080", grpc.ServerCredentials.createInsecure());

function findRecipe(call, callback) {
    let recipe = RECIPES.find((recipe) )
}
