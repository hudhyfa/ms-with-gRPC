const path = require("path");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, "../protos/recipes.proto"),
  {}
);
const recipesProto = grpc.loadPackageDefinition(packageDefinition);
const RECIPES = require("./recipes");

const server = new grpc.Server();
server.addService(recipesProto.Recipes.service, {
  find: findRecipe,
});
server.bindAsync(
  "0.0.0.0:8080",
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`recipe service running on port http://localhost:${port}`);
  }
);

function findRecipe(call, callback) {
  let recipe = RECIPES.find((recipe) => recipe.productId == call.request.id);
  if (recipe) {
    callback(null, recipe);
  } else {
    callback({
      message: "Recipe not found",
      code: grpc.status.INVALID_ARGUMENT,
    });
  }
}
