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
  onSavePathClick: (endPoints: [string, string]) => void;
};

type EditorState = {
  // TODO (task 1): decide on the state to store
};


/** Component that allows user to select buildings to find path between and save paths. */
export class Editor extends Component<EditorProps, EditorState> {
  constructor(props: EditorProps) {
    super(props);

    this.state = {};
  }

  // HINT: componentDidUpdate may be useful in task 5!
  componentDidUpdate = (prevProps: Readonly<EditorProps>, _prevState: Readonly<EditorState>): void =>  {
    if (this.props.savedPaths !== prevProps.savedPaths) {
      // maybe in this case hint hint
    }
  }

  render = (): JSX.Element => {
    // TODO (task 1): fill this in
    return <div style={{display: "inline-block"}}></div>;
  };

  // TODO (task 1): add render helper functions and event handlers as needed.
  //   ALL fetch requests should go in App.tsx! Use callbacks if you're
  //   tempted to add one here.

}
