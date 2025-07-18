import { Location, Edge, sameLocation } from './campus';
import { newPriorityQueue, PriorityQueue } from './priority_queue';
// TODO (task 3): Debug this file

/**
 * A path from one location on the map to another by following along the given
 * steps in the order they appear in the array. Each edge must start at the
 * place where the previous edge ended. We also cache the total distance of the
 * edges in the path for faster access.
 */
export type Path =
    {start: Location, end: Location, steps: Array<Edge>, dist: number};

// Compares two paths by distance, shorter paths have higher priority
// (positive number if a < b, negative number if a > b, 0 if a = b)
const comparePaths = (a: Path, b: Path): number => b.dist - a.dist;

// Converts a location to a string that can be used as a map key.
const toKey = (loc: Location): string => `(${loc.x}, ${loc.y})`;

// Create a graph where locations on campus are vertices and paths between them
// are edges. Graph represented with a map where keys are stringified locations
// mapped to arrays of Edges outgoing from that location
const initGraph = (edges : Array<Edge>): Map<string, Array<Edge>> => {
  const graph = new Map<string, Array<Edge>>();
  for (const e of edges) {
    const children: Edge[] | undefined = graph.get(toKey(e.start));
    if (children !== undefined) {
      children.push(e);
    } else {
      graph.set(toKey(e.start), [e])
    }
  }

  return graph;
}

// examines all the children outgoing from this node. updates active by
// appending shortest path to children that have not yet been explored
const exploreChildren = (active: PriorityQueue<Path>, finished: Set<string>, path: Path, children: Array<Edge> | undefined): void => {
  if (children !== undefined) {
    for (const edge of children) {
      const childKey = toKey(edge.end);
      if (!finished.has(childKey)) {
        // put our new edge into the path since we are not finished
        // path.steps.push(edge);
        const newSteps = [];
        for (const step of path.steps) {
          newSteps.push(step);
        }
        newSteps.push(edge);

        active.add({
            start: path.start, end: edge.end,
            steps: newSteps, dist: path.dist + edge.dist
          });
      }
    }
  }
}

/**
 * Returns the shortest path from the given start to the given ending location
 * that can be made by following along the given edges. If no path exists, then
 * this will return undefined. (Note that all distances must be positive or else
 * shortestPath may not work!)
 */
export const shortestPath = (
    start: Location, end: Location, edges: Array<Edge>): Path | undefined => {

  // Create a map of locations and outgoing edges
  const graph = initGraph(edges);

  // Set of locations for which we already found the shortest path.
  const finished = new Set<string>();

  // Queue of paths outgoing from not yet explored nodes
  const active = newPriorityQueue(comparePaths);

  active.add({
    start: start, end: start,
    steps: [], dist: 0
  });  // start with the starting location

  // Continue to explore whiles we have paths remaining.
  while (active.first()) {
    // get highest priority item from queue of active paths
    const path = active.removeFirst();
    if (sameLocation(path.end, end))
      return path;  // found one and it must be shortest since it was first

    const endKey = toKey(path.end);
    if (finished.has(endKey))
      continue;
    finished.add(endKey);

    exploreChildren(active, finished, path, graph.get(endKey));
  }

  return undefined;  // no path to end
};