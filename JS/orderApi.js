import { BASE_URL } from "./config.js";

export const sendOrderToServer = async (orderPayload) => {
  console.log("Order Payload:", orderPayload); // Log the payload for debugging
  try {
    const response = await fetch(`${BASE_URL}/order/addNewOrder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    const result = await response.json();
    return { ok: response.ok, data: result };
  } catch (error) {
    console.error("Network Error:", error);
    return { ok: false, data: { message: "Network error occurred" } };
  }
};
