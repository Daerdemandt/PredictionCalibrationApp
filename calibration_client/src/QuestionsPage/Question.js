export const questionReducer = (state, action) => {
  switch (action.type) {
    case "ADD":
      return {
        ...state,
        loading: false,
        error: null,
        questions: state.questions.concat(action.payload.questions),
        hasMore: action.payload.hasMore,
        nextPage: state.nextPage + 1,
      };
    case "NEXT":
      return {
        ...state,
        questions: state.questions.slice(0, -1),
      };
    case "ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      throw new TypeError("Illegal action in questionReducer");
  }
};

export const getBlankQuestion = () => ({
  loading: true,
  error: null,
  questions: [],
  hasMore: true,
  nextPage: 0,
});
