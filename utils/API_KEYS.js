const mapAPIkey = "pk.eyJ1IjoiZGF2aWRwYW5nIiwiYSI6ImNrb2JwOGlqZjAyaXIybnM5YjEzdmFkbzMifQ.oAKK6sHsaP3YxPAhXRrkpg"

const GOOGLE_PLACES_API_KEY = 'AIzaSyAKuGciNBsh0rJiuXAvza2LKTl5JWyxUbA';

const GOOGLE_GEOCODING_API_KEY = 'AIzaSyAKuGciNBsh0rJiuXAvza2LKTl5JWyxUbA';

export function MAP_KEY() {
  return mapAPIkey;
}

export function GEOCODING_API() {
  return GOOGLE_GEOCODING_API_KEY;
}

export function PLACES_API() {
  return GOOGLE_PLACES_API_KEY;
}
