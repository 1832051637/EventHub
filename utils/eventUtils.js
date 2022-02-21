import { Alert } from 'react-native';
import { arrayUnion, arrayRemove, updateDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import { db, storage, auth } from '../firebase';
import { deleteObject, ref } from 'firebase/storage';

const deleteAlert = (itemID, itemName, attendeeTokens, setRefresh) => {
    Alert.alert(
        "Deleting \"" + itemName + "\"",
        "Are You Sure?",
        [
            {
                text: "Cancel",
                onPress: () => console.log("Cancel Pressed"),
                style: "cancel"
            },
            { text: "Delete", onPress: () => deleteEvent(itemID, attendeeTokens, setRefresh) }
        ]
    )
};

const sendNotifications = async (token, eventName) => {
    let message = "Someone has joined your event: " + eventName + "!";

    await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "to": token,
            "title": "A New Attendee",
            "body": message
        }),
    }).then((response) => {
        console.log(response.status);
    });
}

const sendUpdateNotifications = async (tokens, eventName) => {
    let message =  "Log in to see the new details!";

    await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "to": tokens,
            "title": eventName + " has changed details",
            "body": message
        }),
    }).then((response) => {
        console.log(response.status);
    });
}

const attendEvent = (eventId, hostToken, eventName, pushToken, setData, data) => {
    const eventRef = doc(db, 'events', eventId);
    const userRef = doc(db, 'users', auth.currentUser.uid);

    updateDoc(eventRef, {
        attendees: arrayUnion(userRef),
        attendeeTokens: arrayUnion(pushToken),
    });

    updateDoc(userRef, {
        attending: arrayUnion(eventRef)
    });

    const newData = data.map(item => {
        if (item.id === eventId) {
            item.isAttending = true;
            return item
        }
        return item;
    });

    sendNotifications(hostToken, eventName);
    setData(newData);
}

const unattendEvent = (eventId, pushToken, setData, data) => {
    const eventRef = doc(db, 'events', eventId);
    const userRef = doc(db, 'users', auth.currentUser.uid);

    updateDoc(eventRef, {
        attendees: arrayRemove(userRef),
        attendeeTokens: arrayRemove(pushToken),
    });

    updateDoc(userRef, {
        attending: arrayRemove(eventRef)
    });

    const newData = data.map(item => {
        if (item.id === eventId) {
            item.isAttending = false;
            return item
        }
        return item;
    })
    setData(newData);
}

//Deletes event and notifys guests
const deleteEvent = async (itemID, tokens, setRefresh) => {
    try {
        let eventRef = doc(db, 'events', itemID);
        let ds = await getDoc(eventRef);
        let imageID = ds.data().imageID;

        if (imageID) {
            let imageRef = ref(storage, 'event-images/' + imageID);
            await deleteObject(imageRef);
        }
        
        await deleteDoc(eventRef);

        console.log("Event has been deleted");

        if (tokens && tokens.length > 0) {
            let message = eventName + " has been cancelled by the host.";
            let response = await fetch("https://exp.host/--/api/v2/push/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "to": tokens,
                    "title": "Event Cancellation",
                    "body": message
                }),
            });

            console.log(response.status);
        }

        setRefresh(true);
        
    } catch (error) {
        console.log('Error deleting event.', error);
    }
};

export { attendEvent, unattendEvent, deleteEvent, deleteAlert }