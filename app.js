let express = require("express");
let app = express();
module.exports = app;

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
app.get("/states/:stateId/", async (request, response) => {
  try {
    let { stateId } = request.params;
    let getStateQuery = `
    SELECT 
    * 
    FROM 
    state
    WHERE 
    state_id = ${stateId};`;
    let dbObject = await db.get(getStateQuery);

    let { state_id, state_name, population } = dbObject;
    let s = {
      stateId: state_id,
      stateName: state_name,
      population: population,
    };
    response.send(s);
    console.log(dbObject);
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
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

//4) GET

app.get("/districts/:districtId/", async (request, response) => {
  try {
    let { districtId } = request.params;
    let getDistrictQuery = `
  SELECT 
  * 
  FROM 
  district
  WHERE 
  district_id = ${districtId};`;
    let dbObject = await db.get(getDistrictQuery);
    let {
      district_id,
      district_name,
      state_id,
      cases,
      cured,
      active,
      deaths,
    } = dbObject;
    let s = {
      districtId: district_id,
      districtName: district_name,
      stateId: state_id,
      cases: cases,
      cured: cured,
      active: active,
      deaths: deaths,
    };
    response.send(s);
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
});

//5) DELETE

app.delete("/districts/:districtId/", async (request, response) => {
  let { districtId } = request.params;
  let deleteDistrictsQuery = `
DELETE 
FROM 
district
WHERE 
district_id = ${districtId};`;
  await db.run(deleteDistrictsQuery);
  response.send("District Removed");
});

//6) PUT

app.put("/districts/:districtId/", async (request, response) => {
  let { districtId } = request.params;
  let { districtName, stateId, cases, cured, active, deaths } = request.body;
  let updateDistrictQuery = `
    UPDATE 
    district
    SET 
        district_name = '${districtName}',
        state_id = '${stateId}',
        cases = '${cases}',
        cured = '${cured}',
        active = '${active}',
        deaths = '${deaths}' `;

  await db.run(updateDistrictQuery);
  response.send("District Details Updated");
});

//7) GET

app.get("/states/:stateId/stats/", async (request, response) => {
  try {
    let { stateId } = request.params;
    let getStatisticsQuery = `
    SELECT 
    * 
    FROM 
    district
    WHERE 
    state_id = ${stateId};
  `;
    let dbObject = await db.get(getStatisticsQuery);

    let { cases, cured, active, deaths } = dbObject;
    let s = {
      totalCases: cases,
      totalCured: cured,
      totalActive: active,
      totalDeaths: deaths,
    };
    response.send(s);
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
});

//8) GET

app.get("/districts/:districtId/details/", async (request, response) => {
  let { districtId } = request.params;
  let getStateNameQuery = `
    SELECT 
    state_name 
    FROM 
    state INNER JOIN district
    ON state.state_id = district.state_id
    WHERE 
    district_id = ${districtId};
  `;
  let dbObject = await db.get(getStateNameQuery);
  let { state_name } = dbObject;
  let s = {
    stateName: state_name,
  };
  response.send(s);
});

