import api from "./api";

export const configApi = {
  getPayment: () => api.get("/config/payment"),
  updatePayment: (value: any) => api.put("/config/payment", { value }),
};

export default configApi;
