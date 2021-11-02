const axios = require("axios");

const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
  try {
    const response = await axios.post(SPACEX_API_URL, {
      query: {},
      options: {
        pagination: false,
        populate: [
          {
            path: "rocket",
            select: {
              name: 1,
            },
          },
          {
            path: "payloads",
            select: {
              customers: 1,
            },
          },
        ],
      },
    });

    if (response.status !== 200) {
      console.error("Problem downloading launch data");
      throw new Error("Launch data download failed");
    }

    const launchDocs = response.data.docs;
    for (const launchDoc of launchDocs) {
      const payloads = launchDoc["payloads"];
      const customers = payloads.flatMap((payload) => {
        return payload["customers"];
      });

      const launch = {
        flightNumber: launchDoc["flight_number"],
        mission: launchDoc["name"],
        rocket: launchDoc["rocket"]["name"],
        launchDate: launchDoc["date_local"],
        upcoming: launchDoc["upcoming"],
        success: launchDoc["success"],
        customers,
      };

      await saveLaunch(launch);
    }
  } catch (err) {
    console.error("Populate Launches Error: ", err);
  }
}

async function loadLaunchData() {
  try {
    const firstLaunch = await findLaunch({
      flightNumber: 1,
      rocket: "Falcon 1",
      mission: "FalconSat",
    });

    if (firstLaunch) {
      console.log("Launch Data already loaded.");
    } else {
      await populateLaunches();
    }
  } catch (err) {
    console.error("Load Launch Data Error: ", err);
  }
}

async function findLaunch(filter) {
  try {
    return await launchesDatabase.findOne(filter);
  } catch (err) {
    console.error("Find Launch Error: ", err);
  }
}

async function launchExistsWithId(launchId) {
  try {
    return await findLaunch({ flightNumber: launchId });
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

async function getAllLaunches(skipVal, limitVal) {
  return await launchesDatabase
    .find({}, { _id: 0, __v: 0 })
    .sort({ flightNumber: 1 })
    .skip(skipVal)
    .limit(limitVal);
}

async function saveLaunch(launch) {
  try {
    await launchesDatabase.findOneAndUpdate(
      {
        flightNumber: launch.flightNumber,
      },
      launch,
      {
        upsert: true,
      }
    );
  } catch (err) {
    console.error("Save Launch Error: ", err);
  }
}

async function scheduleNewLaunch(launch) {
  try {
    const planet = await planets.findOne({ keplerName: launch.target });

    if (!planet) {
      throw new Error("No matching planet found");
    } else {
      const newFlightNumber = (await getLatestFlightNumber()) + 1;
      const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ["NASA", "CANADA"],
        flightNumber: newFlightNumber,
      });

      await saveLaunch(newLaunch);
    }
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
  loadLaunchData,
  launchExistsWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
};
