const launches = new Map();

let latestFlightNumber = 100;

const launch = {
  flightNumber: 100,
  mission: "Kepler Exploration X",
  rocket: "Explorer IS1",
  launchData: new Date("December 27, 2030"),
  target: "Kepler-442 b",
  customer: ["NASA", "CANADA"],
  upcoming: true,
  success: true,
};

launches.set(launch.flightNumber, launch);

function launchExistsWithId(launchId) {
  return launches.has(launchId);
}

function getAllLaunches() {
  return Array.from(launches.values());
}

function addNewLaunch(launch) {
  latestFlightNumber++;
  launches.set(
    latestFlightNumber,
    Object.assign(launch, {
      flightNumber: latestFlightNumber,
      customers: ["NASA, CANADA"],
      upcoming: true,
      success: true,
    })
  );
}

function abortLaunchById(launchId) {
  const aborted = launches.get(launchId);

  aborted.upcoming = false;
  aborted.success = false;

  return aborted;
}

module.exports = {
  launchExistsWithId,
  getAllLaunches,
  addNewLaunch,
  abortLaunchById,
};
