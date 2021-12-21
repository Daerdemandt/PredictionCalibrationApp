export const Answer = {
  INVALID: -1,
  NO: 0,
  YES: 1,
  DONTKNOW: 2,
};
Object.freeze(Answer);

export const answerToString = (answer) => {
  if (answer === 0 || answer === false) return "Нет";
  else if (answer === 1 || answer === true) return "Да";
  else if (answer === 2) return "Не знаю";
  else if (answer === -1) return "Нет ответа";
  throw new Error(`Unknown answer ${answer}`);
};

export const getBlankAnswer = (userId) => ({
  ynq_id: -1,
  user_id: userId,
  answer: Answer.INVALID,
  probability: -1,
  confirmed: false,
});

export function getAnswerReducer(userId) {
  return (state, action) => {
    switch (action.type) {
      case "RESET":
        return getBlankAnswer(userId);
      case "SET_QUESTION_ID":
        return {
          ...state,
          ynq_id: action.payload,
        };
      case "SET_YN":
        return {
          ...state,
          answer: action.payload,
        };
      case "SET_PROBABILITY":
        return {
          ...state,
          probability: action.payload,
        };
      case "CONFIRM":
        return {
          ...state,
          confirmed: true,
        };
      default:
        throw new TypeError("Illegal action in getAnswerReducer");
    }
  };
}
