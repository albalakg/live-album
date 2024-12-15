import Translator from '@/helpers/translator'

class ErrorsHandler {
  getErrorMessage(error: Error | any, fallbackMsg = ''): string {
    let responseMsg = '';

    error = error?.response?.data;
    if (!error) {
      return responseMsg ?? fallbackMsg;
    }

    // If error contains "errors", extract the first error message
    if (error.errors && typeof error.errors === "object") {
      for (const key in error.errors) {
        if (Array.isArray(error.errors[key]) && error.errors[key].length > 0) {
          responseMsg = error.errors[key][0]; // Return the first error message
        }
      }
    }

    // If error has a "message" field, return it
    if (!responseMsg && error.message && typeof error.message === "string") {
      responseMsg = error.message;
    }

    return Translator.getMessage(responseMsg) ?? fallbackMsg ?? this.getDefaultErrorMessage();
  }

  getDefaultErrorMessage(): string {
    return "מצטערים אך קרתה תקלה, נסה שוב בקרוב.";
  }
}

export default new ErrorsHandler();
