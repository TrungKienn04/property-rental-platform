import actionTypes from "../actions/actionTypes";

const initState = {
    currentData: {},
    isLoadingCurrent: false,
    isCurrentResolved: false,
}

const userReducer = (state = initState, action) => {
    switch (action.type) {
        case actionTypes.GET_CURRENT_REQUEST:
            return {
                ...state,
                isLoadingCurrent: true,
            }
        case actionTypes.GET_CURRENT:
            return {
                ...state,
                currentData: action.currentData || {},
                isLoadingCurrent: false,
                isCurrentResolved: true,
            }
        case actionTypes.LOGOUT:
            return {
                ...state,
                currentData: {},
                isLoadingCurrent: false,
                isCurrentResolved: false,
            }


        default:
            return state;
    }
}

export default userReducer
