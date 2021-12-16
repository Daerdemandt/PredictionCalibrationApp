export default function prettifyResponseError(error) {
  try {
    switch (error.response.status) {
      case 500:
        return "Ошибка 500; запущен ли бэкэнд сервер?";
      case 404:
        return "Ошибка 404; не поменял ли кто-то адрес в API?";
      case 405:
        return "Ошибка 405; не тот метод запроса";
      default:
        return error.response.data;
    }
  } catch (e) {
    return JSON.stringify(error);
  }
}
