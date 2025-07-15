import React, { Component } from 'react';
import { Building } from './types';


// NOTE: you may change types of props, if desired! These are only reccomendations.
// You shouldn't need more props than these, but you can add others, if desired.
type EditorProps = {
  /** Names of all the buildings that are available to choose. */
  buildings: Array<Building>;

  /** Names of all the buildings that are available to choose. */
  savedPaths: Array<[Building, Building]>;

  /** Called to note that the selection has changed. */
  onEndPointChange: (endPoints?: [Building, Building]) => void;

  /** Called to save the path currently displayed on the map. */
  onSavePathClick: (endPoints: [Building, Building]) => void;
};

type EditorState = {
  // TODO (task 1): decide on the state to store
  fromBuilding: string;
  toBuilding: string;
  savedPath: string;
};


/** Component that allows user to select buildings to find path between and save paths. */
export class Editor extends Component<EditorProps, EditorState> {
  constructor(props: EditorProps) {
    super(props);

    this.state = {
      fromBuilding: '',
      toBuilding: '',
      savedPath: ''
    };
  }

  // HINT: componentDidUpdate may be useful in task 5!
  componentDidUpdate = (prevProps: Readonly<EditorProps>, _prevState: Readonly<EditorState>): void =>  {
    if (this.props.savedPaths !== prevProps.savedPaths) {
      // maybe in this case hint hint
      this.setState({
        fromBuilding: '',
        toBuilding: '',
        savedPath: ''
      });
    }
  }

  render = (): JSX.Element => {
    // TODO (task 1): fill this in
    const fromBuilding = this.state.fromBuilding;
    const toBuilding = this.state.toBuilding;
    const savedPath = this.state.savedPath;
    return <div style={{ display: "inline-block" }}>
      <div>
        <h2>Select to find path</h2> 
        <br/>
        <label htmlFor='fromBuilding'>From: </label>
        <select id='fromBuilding' value={String(fromBuilding)} onChange={this.doFromBuildingChange}>
          <option value="">(choose a building)</option>
          {this.renderBuildings()}
        </select>
        <label htmlFor='toBuilding'>To: </label>
        <select id='toBuilding' value={String(toBuilding)} onChange={this.doToBuildingChange}>
          <option value="">(choose a building)</option>
          {this.renderBuildings()}
        </select>
        <br/>
        <label htmlFor='savedPath'>(fill with saved path)</label>
        <select id='savedPath' value={String(savedPath)} onChange={this.doSavedPathChange}>
          <option value="">(choose a saved path)</option>
          {this.renderBuildings()}
        </select>
      </div>
        <div>
          <button onClick={this.doSavePathClick}>Save Path</button>
          <button onClick={this.doClearClick}>Clear</button>
      </div>
    </div>;
  };

  // TODO (task 1): add render helper functions and event handlers as needed.
  //   ALL fetch requests should go in App.tsx! Use callbacks if you're
  //   tempted to add one here.

  /** Renders building options for dropdowns */
  renderBuildings = (): JSX.Element[] => {
    const elems: JSX.Element[] = [];
    for (const building of this.props.buildings) {
      elems.push(
        <option value={building.shortName} key={building.shortName}>
          {building.longName}
        </option>
      );
    }
    return elems;
  }

  /** Handles save path button click */
  doSavePathClick = (): void => {
    const fromBuilding: string = this.state.fromBuilding;
    const toBuilding: string = this.state.toBuilding;
    
    if (fromBuilding && toBuilding) {
      const fromBuildingObj: Building | undefined = this.props.buildings.find(b => b.shortName === fromBuilding);
      const toBuildingObj: Building | undefined = this.props.buildings.find(b => b.shortName === toBuilding);
      
      if (fromBuildingObj && toBuildingObj) {
        this.props.onSavePathClick([fromBuildingObj, toBuildingObj]);
      }
    }
  }

  /** Handles clear button click */
  doClearClick = (): void => {
    this.setState({
      fromBuilding: '',
      toBuilding: '',
      savedPath: ''
    });
    this.props.onEndPointChange(undefined);
  }

  /** Handles from building dropdown change */
  doFromBuildingChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const fromBuildingShortName: string = event.target.value;
    this.setState({ fromBuilding: fromBuildingShortName });

    // Only call onEndPointChange if both buildings are selected
    if (fromBuildingShortName && this.state.toBuilding) {
      const fromBuildingObj: Building | undefined = this.props.buildings.find(b => b.shortName === fromBuildingShortName);
      const toBuildingObj: Building | undefined = this.props.buildings.find(b => b.shortName === this.state.toBuilding);
      
      if (fromBuildingObj && toBuildingObj) {
        this.props.onEndPointChange([fromBuildingObj, toBuildingObj]);
      }
    }
  }

  /** Handles to building dropdown change */
  doToBuildingChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const toBuildingShortName: string = event.target.value;
    this.setState({ toBuilding: toBuildingShortName });
    
    // Only call onEndPointChange if both buildings are selected
    if (this.state.fromBuilding && toBuildingShortName) {
      const fromBuildingObj: Building | undefined = this.props.buildings.find(b => b.shortName === this.state.fromBuilding);
      const toBuildingObj: Building | undefined = this.props.buildings.find(b => b.shortName === toBuildingShortName);
      
      if (fromBuildingObj && toBuildingObj) {
        this.props.onEndPointChange([fromBuildingObj, toBuildingObj]);
      }
    }
  }

  doSavedPathChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const selectedIndex: string = event.target.value;
    this.setState({ savedPath: selectedIndex });
    
    if (selectedIndex !== '') {
      const pathIndex: number = parseInt(selectedIndex);
      const selectedPath: [Building, Building] = this.props.savedPaths[pathIndex];
      
      if (selectedPath) {
        this.setState({
          fromBuilding: selectedPath[0].shortName,
          toBuilding: selectedPath[1].shortName
        });
        // Call onEndPointChange since we now have both buildings selected
        this.props.onEndPointChange([selectedPath[0], selectedPath[1]]);
      }
    }
  }
}
