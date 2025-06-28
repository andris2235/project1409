import axios, { type AxiosInstance } from 'axios';

export const baseURL = import.meta.env.VITE_API_URL as string;

const $host: AxiosInstance = axios.create({
  baseURL,
});


export {$host};