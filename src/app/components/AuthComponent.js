import jwt from 'jsonwebtoken';

export function storeToken(token) {

  // Store token in a cookie
  document.cookie = `token=${token}; path=/`;

}

export function decodeToken(token) {
  // Decode the JWT token to extract information
  const decoded = jwt.decode(token);
  return decoded;
}

export function isTokenExpired(decodedToken) {
    // Check if the token's expiration time (exp) is in the past
    return decodedToken.exp * 1000 < Date.now(); // Convert exp to milliseconds
  }

// Function to retrieve cookie value by name
export function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
}
