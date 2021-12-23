function filterDuplicates(newQs, filterQs) {
  return newQs.filter((newQ) => {
    return (
      filterQs.find((filterQ) => filterQ.question === newQ.question) == null
    );
  });
}

export const questionReducer = (state, action) => {
  switch (action.type) {
    case "ADD":
      // Some questions will still be present here in state.questions as cache
      let newQuestions = filterDuplicates(
        action.payload.questions,
        state.questions
      );
      return {
        ...state,
        loading: false,
        error: null,
        questions: newQuestions.concat(state.questions),
        hasMore: action.payload.hasMore,
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
});
