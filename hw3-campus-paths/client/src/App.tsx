import React, { Component } from 'react';
import { isRecord, Building, Edge, parseBuildings, parseEndpointPairs } from './types';
import { Editor } from './Editor';
import campusMap from './img/campus_map.jpg';
import './App.css'

// Radius of the circles drawn for each marker.
const RADIUS: number = 30;


type AppProps = {};  // no props

type AppState = {
  buildings?: Array<Building>;       // list of known buildings
  savedPaths?: Array<[Building, Building]>  // list of paths ([start, end] buildings) user has saved
  endPoints?: [Building, Building];  // end for path
  path?: Array<Edge>;                // shortest path between end points

  // TODO: add state as needed
};


/** Top-level component that displays UW Campus map and Editor. */
export class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    // TODO (task 2): remove 'buildings: [...], savedPaths: [...]' from state
    this.state = {};
  }

  componentDidMount = (): void => {
    // TODO (task 2): uncomment the fetch request below, and start debugging!
    fetch('/api/appData')
      .then(this.doAppDataResp)
      .catch((ex) => this.doAppDataError(`failed to connect ${ex}`));
  }

  render = (): JSX.Element => {
    if (this.state.buildings === undefined || this.state.savedPaths === undefined) {
      return <p>Loading building information...</p>;
    } else {
      return <div>
          <h1>Campus Paths</h1>
          <svg id="svg" width="866" height="593" viewBox="0 0 4330 2964">
            <image href={campusMap} width="4330" height="2964"/>
            {this.renderPath()}
            {this.renderEndPoints()}
          </svg>
          <br></br>
          <Editor buildings={this.state.buildings} savedPaths={this.state.savedPaths}
            onSavePathClick={this.doSavePathClick} onEndPointChange={this.doEndPointChange}/>
        </div>;
    }
  };

  // Returns SVG elements for the two end points.
  renderEndPoints = (): Array<JSX.Element> => {
    if (this.state.endPoints === undefined) {
      return [];
    } else {
      const [start, end] = this.state.endPoints;
      return [
          <circle cx={start.location.x} cy={start.location.y} fill={'red'} r={RADIUS}
              stroke={'white'} strokeWidth={10} key={'start'}/>,
          <circle cx={end.location.x} cy={end.location.y} fill={'blue'} r={RADIUS}
              stroke={'white'} strokeWidth={10} key={'end'}/>
        ];
    }
  };

  // Returns SVG elements for the edges on the path.
  renderPath = (): Array<JSX.Element> => {
    if (this.state.path === undefined) {
      return [];
    } else {
      const elems: Array<JSX.Element> = [];
      for (const [i, e] of this.state.path.entries()) {
        elems.push(<line x1={e.start.x} y1={e.start.y} x2={e.end.x} y2={e.end.y}
          key={i} stroke={'darkViolet'} strokeLinecap={'round'} strokeWidth={20}/>)
      }
      return elems;
    }
  };

  // Called with the response object from request for app data
  doAppDataResp = (res: Response): void => {
    if (res.status === 200) {
      res.json()
        .then(this.doAppDataJson)
        .catch((msg) => this.doAppDataError(`Error parsing 200 response. ${msg}`));
    } else {
      this.doAppDataError(`bad status code: ${res.status}`);
    }
  };

  // Parses JSON data received from app data fetch.
  doAppDataJson = (data: unknown): void => {
    if (!isRecord(data))
      throw new Error(`data is not a record: ${typeof data}`);

    const buildings = parseBuildings(data.buildings);
    const savedPaths = parseEndpointPairs(data.savedPaths);
    this.setState({buildings: buildings, savedPaths: savedPaths});
  };

  // Presents error messages related to fetching app data
  doAppDataError = (msg: string): void => {
    console.error(`fetch of app data failed. ${msg}`)
  };


   // Called when user selects 2 endpoints, fetches shortest path between points
  doEndPointChange = (endPoints?: [Building, Building]): void => {
    this.setState({endPoints: endPoints, path: undefined});
    // if undefined, no path to show
    if (endPoints !== undefined) {
      const [start, end] = endPoints;
      console.log(`Finding a path between "${start.longName}" and "${end.longName}"`);
      // TODO (task 4): fetch the shortest path and add helper functions to parse response
      fetch(`/api/shortestPath?start=${start.shortName}&end=${end.shortName}`)
        .then(this.doShortestPathResp)
        .catch((msg) => this.doEndPointChangeError(`Error fetching shortest path. ${msg}`));
    }
  }

  doShortestPathResp = (res: Response): void => {
    if (res.status === 200) {
      res.json()
        .then(this.doShortestPathJson)
        .catch((msg) => this.doEndPointChangeError(`Error parsing 200 response. ${msg}`));
    } else {
      this.doEndPointChangeError(`bad status code: ${res.status}`);
    }
  };

  doShortestPathJson = (data: unknown): void => {
    if (!Array.isArray(data)) {
      throw new Error(`data is not an array: ${typeof data}`);
    }
    const path: Array<Edge> = [];
    for (const edge of data) {
      if (!isRecord(edge)) {
        this.doEndPointChangeError(`edge is not a record: ${typeof edge}`);
        return;
      }
      if (!isRecord(edge.start) || !isRecord(edge.end)) {
        this.doEndPointChangeError(`edge start or end is not a record ${typeof edge.start} or ${typeof edge.end}`);
        return;
      }
      if (typeof edge.start.x !== 'number' || typeof edge.start.y !== 'number' ||
          typeof edge.end.x !== 'number' || typeof edge.end.y !== 'number') {
        this.doEndPointChangeError(`edge coordinates are not numbers ${typeof edge.start.x}, ${typeof edge.start.y}, ${typeof edge.end.x}, ${typeof edge.end.y}`);
        return;
      }
      
      path.push({
        start: {x: edge.start.x, y: edge.start.y},
        end: {x: edge.end.x, y: edge.end.y}
      });
    }

    this.setState({path: path});


  }

  doEndPointChangeError = (msg: string): void => {
    console.error(`fetch of shortest path failed. ${msg}`);
    this.setState({endPoints: undefined, path: undefined});
  };


  // Called when user clicks to save a path, saves on server
  doSavePathClick = (endPoints: [string, string]): void => {
    const [start, end] = endPoints;
    // TODO (task 5): save path on server and add helper functions to parse response
    fetch('/api/savePath', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([start, end])
    })
      .then((res) => this.doSavePathResp(res, start, end))
      .catch((msg) => this.doSavePathError(`Error saving path. ${msg}`));
  }

  // Handles the response from saving a path
  doSavePathResp = (res: Response, start: string, end: string): void => {
    if (res.status === 200) {
      console.log(`Path from "${start}" to "${end}" saved successfully`);
      // Refresh the saved paths list
      fetch('/api/appData')
        .then(this.doAppDataResp)
        .catch((ex) => this.doAppDataError(`failed to connect ${ex}`));
    } else {
      this.doSavePathError(`bad status code: ${res.status}`);
    }
  };

  // Handles errors from saving a path
  doSavePathError = (msg: string): void => {
    console.error(`Failed to save path. ${msg}`);
  };
}
