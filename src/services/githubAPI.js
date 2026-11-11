
import axios from "axios";

const BASE_URL = "https://api.github.com";

// Fetch GitHub user profile
export const getUserProfile = async (username) => {
  const response = await axios.get(
    `${BASE_URL}/users/${encodeURIComponent(username)}`
  );

  return response.data;
};

// Fetch user repositories
export const getUserRepos = async (username) => {
  const response = await axios.get(
    `${BASE_URL}/users/${encodeURIComponent(username)}/repos`,
    {
      params: {
        sort: "updated",
        per_page: 100
      }
    }
  );

  return response.data;
};
