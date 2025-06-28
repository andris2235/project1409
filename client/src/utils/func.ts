import axios from "axios";

export const buildQueryParams = (params: QueryType) => {
  const queryParams = [];

  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      const value = params[key];
      if (value) {
        queryParams.push(`${key}=${encodeURIComponent(value.toString())}`);
      }
    }
  }

  return queryParams.join("&");
};

export interface QueryType {
  [key: string]: string | number | Date | undefined;
}

export const handlerAxiosError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error?.response?.data.message;
  } else {
    return "Произошла непредвиденная ошибка";
  }
};