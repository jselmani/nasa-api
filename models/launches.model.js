const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 100;

const launch = {
  flightNumber: 100,
  mission: "Kepler Exploration X",
  rocket: "Explorer IS1",
  launchDate: new Date("December 27, 2030"),
  target: "Kepler-442 b",
  customers: ["NASA", "CANADA"],
  upcoming: true,
  success: true,
};

saveLaunch(launch);

async function launchExistsWithId(launchId) {
  try {
    return await launchesDatabase.findOne({ flightNumber: launchId });
  } catch (err) {
    console.error("Launch Exists with ID Error: ", err);
  }
}

async function getLatestFlightNumber() {
  try {
    // look for latest launch by sorting and then passing the '-' in front of sorted property
    // in this case flightNumber.  findOne() will return the first item in the list which is
    // the most recent launch.  sort() sorts items in ascending order by default.
    const latestLaunch = await launchesDatabase.findOne().sort("-flightNumber");

    if (!latestLaunch) {
      return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLaunch.flightNumber;
  } catch (err) {
    console.error("Get Latest Flight Number Error: ", err);
  }
}

async function getAllLaunches() {
  return await launchesDatabase.find(
    {},
    {
      _id: 0,
      __v: 0,
    }
  );
}

async function saveLaunch(launch) {
  try {
    const planet = await planets.findOne({ keplerName: launch.target });

    if (!planet) {
      throw new Error("No matching planet found");
    } else {
      await launchesDatabase.findOneAndUpdate(
        {
          flightNumber: launch.flightNumber,
        },
        launch,
        {
          upsert: true,
        }
      );
    }
  } catch (err) {
    console.error("Error: ", err);
  }
}

async function scheduleNewLaunch(launch) {
  try {
    const newFlightNumber = (await getLatestFlightNumber()) + 1;
    const newLaunch = Object.assign(launch, {
      success: true,
      upcoming: true,
      customers: ["NASA", "CANADA"],
      flightNumber: newFlightNumber,
    });

    await saveLaunch(newLaunch);
  } catch (err) {
    console.error("Schedule New Launch Error: ", err);
  }
}

async function abortLaunchById(launchId) {
  try {
    const aborted = await launchesDatabase.updateOne(
      { flightNumber: launchId },
      {
        upcoming: false,
        success: false,
      }
    );

    return aborted.acknowledged && aborted.modifiedCount === 1;
  } catch (err) {
    console.error("Abort Launch By Id Error: ", err);
  }
}

module.exports = {
  launchExistsWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
};
