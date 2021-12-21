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
      let newAnswered =
        state.answeredQuestions.length > 10
          ? state.answeredQuestions.slice(0, -1)
          : Object.assign([], state.answeredQuestions);
      newAnswered = [
        {
          userAnswer: action.payload,
          ...state.questions[state.questions.length - 1],
        },
        ...newAnswered,
      ];
      return {
        ...state,
        questions: state.questions.slice(0, -1),
        answeredQuestions: newAnswered,
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
  answeredQuestions: [],
  hasMore: true,
  nextPage: 0,
});
