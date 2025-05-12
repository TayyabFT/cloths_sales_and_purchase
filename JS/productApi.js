import { BASE_URL } from "./config.js";

export const getProducts = async (category) => {
  try {
    const response = await fetch(
      `${BASE_URL}/product/getProducts?category=${encodeURIComponent(category)}`
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const products = await response.json();
    console.log("Response", products);
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const getProductById = async (productId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/product/getProductById/${productId}`
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const product = await response.json();
    console.log("Product Details:", product);
    return product;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
  }
};
