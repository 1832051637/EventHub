import Geohash from 'latlon-geohash';
import Geocoder from 'react-native-geocoding';
import { addDoc, doc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import events from './eventData';
import { GOOGLE_MAPS_API_KEY } from '@env';

async function uploadEvents() {
    const ucscRef = doc(db, 'organizations', 'xq9c1fJ6pOsJuIgoMl8x');

    events.forEach(async (event, index) => {
        let json;
        try {
            Geocoder.init(`${GOOGLE_MAPS_API_KEY}`, { language: "en" });
            json = await Geocoder.from(event.location);

        } catch (error) {
            console.log(error);
            return;
        }

        const location = json.results[0].geometry.location;
        const address = json.results[0].formatted_address;

        const eventData = {
            name: event.name,
            description: event.description,
            attendeeLimit: '',
            startTime: new Date(event.startDate),
            endTime: new Date(event.endDate),
            attendees: [],
            host: ucscRef,
            hostToken: '',
            attendeeTokens: [],
            imageID: '',
            image: event.imageUrl,
            location: '',
            lat: location.lat,
            lon: location.lng,
            address: address,
            geoLocation: Geohash.encode(location.lat, location.lng, 3),
        }

        ref = await addDoc(collection(db, "events"), eventData);
        console.log(ref.id);
    })
}

export default uploadEvents;