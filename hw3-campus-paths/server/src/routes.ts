import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { BUILDINGS, EDGES, Building } from './campus';
import { shortestPath } from "./dijkstra";

// Require type checking of request body.
type SafeRequest = Request<ParamsDictionary, {}, Record<string, unknown>>;
type SafeResponse = Response;  // only writing, so no need to check

// TODO (task 5): use this to store saved paths sent from client
const savedPaths: Array<[Building, Building]> = new Array<[Building, Building]>();

/**
 * Responds with lists of app data including a list of campus buildings and
 *  a list of previously saved paths.
 * @param _req Request object
 * @param res Response object.
 *  - sends 200 with record containing 'buildings' (array of Building objects,
 *    each with a 'shortName' 'longName' and location), and 'savedPaths' (array
 *    of [Building, Building] tuples, the start and end of a saved path)
 */
export const getAppData = (_req: SafeRequest, res: SafeResponse): void => {
  res.json({buildings: BUILDINGS, savedPaths: savedPaths});
};


/**
 * Finds shortest path between given start and end buildings.
 * @param req Request object.
 * @param res Response object.
 */
export const getShortestPath = (req: SafeRequest, res: SafeResponse): void => {
  // TODO (task 4): finish implementing this route to get the shortest path
  // console.log(`log to quiet warning about unused variables: ${req} & ${res}. remove!`);
  const start = first(req.query.start);
  const end = first(req.query.end);

  if (start === undefined || end === undefined) {
    res.status(400).send("Missing start or end location");
    return;
  }

  // Change these values manually to test them
  // const loc1 = {x: 2259.7112, y: 1715.5273};
  // const loc2 = {x: 1895.8038, y: 1325.861};

  // const path = shortestPath(loc1, loc2, EDGES);
  const startBuilding = BUILDINGS.find(b => b.shortName === start);
  const endBuilding = BUILDINGS.find(b => b.shortName === end);
  
  if (!startBuilding || !endBuilding) {
    res.status(404).send("One or both buildings not found");
    return;
  }
  
  const path = shortestPath(
    startBuilding.location,
    endBuilding.location,
    EDGES
  );

  if (path === undefined) {
    res.status(404).send("No path found between the buildings");
    return;
  }

  const clientPath: Array<{start: {x: number, y: number}, end: {x: number, y: number}}> = [];
  
  for (const step of path.steps) {
    clientPath.push({
      start: step.start,
      end: step.end
    });
  }

  res.json(clientPath);
}

// TODO (task 5): add a route to get the shortest path
/**
 * 
 * @param req Request object.
 * @param res Response object.
 * @returns saved path.
 */
export const savePath = (req: SafeRequest, res: SafeResponse): void => {
  const start = req.body.start;
  const end = req.body.end;
  
  if (typeof start !== 'string' || typeof end !== 'string') {
    res.status(400).send("Invalid start or end building");
    return;
  }
  
  const startBuilding = BUILDINGS.find(b => b.shortName === start);
  const endBuilding = BUILDINGS.find(b => b.shortName === end);
  
  if (!startBuilding || !endBuilding) {
    res.status(404).send("One or both buildings not found");
    return;
  }
  
  savedPaths.push([startBuilding, endBuilding]);
  res.status(200).send("Path saved successfully");
};

// Helper to return the (first) value of the parameter if any was given.
// (This is mildly annoying because the client can also give multiple values,
// in which case, express puts them into an array.)
const first = (param: unknown): string|undefined => {
  if (Array.isArray(param)) {
    return first(param[0]);
  } else if (typeof param === 'string') {
    return param;
  } else {
    return undefined;
  }
};