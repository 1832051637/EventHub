import { Alert } from 'react-native';
import { arrayUnion, arrayRemove, updateDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import { db, storage, auth } from '../firebase';
import { deleteObject, ref } from 'firebase/storage';
import { isProfane } from 'bad-words';

const deleteAlert = (itemID, itemName, attendeeTokens, setEventDeleted) => {
    Alert.alert(
        "Deleting \"" + itemName + "\"",
        "Are You Sure?",
        [
            {
                text: "Cancel",
                onPress: () => console.log("Cancel Pressed"),
                style: "cancel"
            },
            { text: "Delete", onPress: () => deleteEvent(itemID, attendeeTokens, setEventDeleted) }
        ]
    )
};

const inputValidator = (event) => {
    let valid = true;
    let errors = "";
    var Filter = require('bad-words'),
    filter = new Filter();
    filter.removeWords('fart', 'hell', 'poop'); //necessary. Feel free to add/remove any other words @lang.json
    if (!event.name.replace(/\s/g, '').length || event.name.length > 30) {
        valid = false;
        errors += "- Event name cannot be empty or greater than 30 characters\n";
    }
    if (filter.isProfane(event.name) || filter.isProfane(event.description)) {
        valid = false;
        errors += "- Event name and description cannot contain profane language!\n";
    }
    if (!event.attendeeLimit.replace(/\s/g, '').length || Number(event.attendeeLimit) < 2) {
        valid = false;
        errors += "- Attendee limit must be at least a couple people\n";
    }
    if (Number(event.attendeeLimit) > 1000000) {
        valid = false;
        errors += "- Attendee limit must be realistic\n";
    }
    if (!event.location.replace(/\s/g, '').length) {
        valid = false;
        errors += "- Location cannot be empty or invalid";
    }
    return {valid: valid, errors: errors};
};

const inputValidationAlert = (errors) => {
    Alert.alert(
        "Please fix the following errors:",
        errors,
        [
            {
                text: "OK",
                style: "cancel"
            }
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
    if (tokens.length > 0) {
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
const deleteEvent = async (itemID, tokens, setEventDeleted) => {
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

        setEventDeleted(true);
        
    } catch (error) {
        console.log('Error deleting event.', error);
    }
};

export { attendEvent, unattendEvent, deleteEvent, deleteAlert,
        inputValidator, inputValidationAlert, sendUpdateNotifications }