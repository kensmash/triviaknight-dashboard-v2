export default function reducer(state, action) {
  switch (action.type) {
    case "UPDATE_CONNECTION": {
      return {
        ...state,
        isConnected: action.payload
      };
    }
    case "UPDATE_HOMEPAGELOADED": {
      return {
        ...state,
        homePageLoaded: action.payload
      };
    }

    default:
      return state;
  }
}
