const path = require("path");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, "../protos/kitchen.proto")
);
const chefProto = grpc.loadPackageDefinition(packageDefinition, {});

const server = new grpc.Server();
server.addService(chefProto.Kitchen.service, {
  chef: chef,
});
server.bindAsync(
  "0.0.0.0:8181",
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`chef service running on port http://localhost:${port}`);
  }
);

function chef(call) {
    let orderRequest = call.request;
    let time = orderRequest.orderId * 1000 + orderRequest.recipeId * 10;

    call.write({status: 1});
    setTimeout(() => {
        call.write({status: 2});
        setTimeout(() => {
            call.write({status: 3});
            call.end();
        }, time);
    }, time);
}
