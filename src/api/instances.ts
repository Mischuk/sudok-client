import axios from "axios";
import { QueryClient } from "react-query";
import { io } from "socket.io-client";
/*
    AXIOS
*/
const axiosInstance = axios.create({
  baseURL: "https://sudok-serv.onrender.com/api",
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_CANCELED") {
      return Promise.resolve({ status: 499 });
    } else {
      return Promise.reject((error.response && error.response.data) || "Error");
    }
  }
);

/*
    REACT QUERY
*/
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 0,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      retry: 0,
    },
  },
});

/*
    WEBSOCKET
*/
const socket = io(`https://sudok-serv.onrender.com`);

export { axiosInstance as api, queryClient, socket };
