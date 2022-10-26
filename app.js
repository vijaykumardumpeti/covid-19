let express = require("express");
let app = express();

app.use(express.json());

let { open } = require("sqlite");
let sqlite3 = require("sqlite3");

let path = require("path");
let dbPath = path.join(__dirname, "covid19India.db");
let db = null;

let intializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started at: http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};
intializeDBAndServer();

//1) get
app.get("/states/", async (request, response) => {
  let getStatesQuery = `
    SELECT 
    * 
    FROM 
    state
    `;
  let dbObject = await db.all(getStatesQuery);

  let myArray = [];
  for (let object of dbObject) {
    let s = {
      stateId: object.state_id,
      stateName: object.state_name,
      population: object.population,
    };
    myArray.push(s);
  }

  response.send(myArray);
});

//2) get state:Id
app.get("/states/:stateId/", (request, response) => {
  let { stateId } = request.params;
  let getStateQuery = `
  SELECT 
  * 
  FROM 
  state
  WHERE 
  state_id = ${stateId};
  `;
  let dbObject = db.get(getStateQuery);

  let { state_id, state_name, population } = dbObject;
  let s = {
    stateId: state_id,
    stateName: state_name,
    population: population,
  };
  response.send(s);
});

//3) post

app.post("/districts/", async (request, response) => {
  try {
    let { districtName, stateId, cases, cured, active, deaths } = request.body;
    let createDistrictQuery = `
   INSERT INTO 
   district (district_name, state_id, cases, cured, active, deaths)
   VALUES (
       '${districtName}',
       '${stateId}',
       '${cases}',
       '${cured}',
       '${active}',
       '${deaths}'
   ); `;
    await db.run(createDistrictQuery);
    response.send("District Successfully Added");
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
});
