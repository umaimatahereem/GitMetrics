
import axios from "axios";

const BASE_URL = "https://api.github.com";

// Fetch GitHub user profile
export const getUserProfile = async (username) => {
  const response = await axios.get(
    `${BASE_URL}/users/${encodeURIComponent(username)}`
  );

  return response.data;
};
