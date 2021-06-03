const {DynamoDBClient, ListTablesCommand, DescribeTableCommand} =  require("@aws-sdk/client-dynamodb");
const AWSXRay = require("aws-xray-sdk-core");
//AWSXRay.setDaemonAddress('127.0.0.1:2000');

// This is necessary since SAM local invokes do not work with XRay
const ddbClient = process.env.AWS_SAM_LOCAL?new DynamoDBClient({ region: "us-east-2" }): AWSXRay.captureAWSv3Client(new DynamoDBClient({ region: "us-east-2" }));

// Add some middleware logic
ddbClient.middlewareStack.add(
  (next, context) => (args) => {
    args.request.headers["Custom-Header"] = "value";
    console.log("\n -- printed from inside middleware -- \n");
    return next(args);
  },
  {
    step: "build",
  }
);

const command = new ListTablesCommand({});

exports.handler = async function(event, context) {
  console.log(process.env.AWS_SAM_LOCAL?"Running in Local mode":"Running in AWS");
  try {
    
    // Command API example
    const results = await ddbClient.send(command);
    results.TableNames.forEach(element => {
      console.log(element)
    });

  
    // Send another command
    const descCommand = new DescribeTableCommand({TableName: 'Images'});
    const descResults =  await ddbClient.send(descCommand);
    console.log (JSON.stringify(descResults));
  

    /* Promise chaining example, instead of async awaits
    ddbClient.send(command)
      .then((data) => {
        data.TableNames.forEach(element => {
          console.log(element)
        });
      })
      .catch((error) => {
        console.log(error)
      })
      .finally(() => {
        console.log("done")
      })
    */

    } catch (err) {
      console.error(err);
    }

    return "Success"
}