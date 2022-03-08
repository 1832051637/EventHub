import { Alert } from 'react-native';
import { arrayUnion, arrayRemove, updateDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import { db, storage, auth } from '../firebase';
import { deleteObject, ref } from 'firebase/storage';

// Asks user if they want to delete an event
const deleteAlert = (itemID, itemName, attendeeTokens, setEventDeleted) => {
    Alert.alert(
        "Deleting \"" + itemName + "\"",
        "Are You Sure?",
        [
            {
                text: "Cancel",
                style: "cancel",
            },
            { text: "Delete", onPress: () => deleteEvent(itemID, attendeeTokens, setEventDeleted) }
        ]
    )
};

// Validates information to create profile
const profileValidator = (firstName, lastName) => {
    let valid = true;
    let errors = "";
    let Filter = require('bad-words'),
    filter = new Filter();
    if (!firstName.replace(/\s/g, '').length || firstName.length > 20) {
        valid = false;
        errors += "- First name must be between 1 and 20 characters\n";
    }
    if (!lastName.replace(/\s/g, '').length || firstName.length > 20) {
        valid = false;
        errors += "- Last name must be between 1 and 20 characters\n";
    }
    if (filter.isProfane(firstName) || filter.isProfane(lastName)) {
        valid = false;
        errors += "- Name cannot contain profane language!\n";
    }
    return {valid: valid, errors: errors};
};

// Validates information to create event
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
    if (event.attendeeLimit.replace(/\s/g, '').length && Number(event.attendeeLimit) < 2) {
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
    if (event.endTime < event.startTime) {
        valid = false;
        errors += "- The end time must be after the start time";
    }
    return {valid: valid, errors: errors};
};

// Alerts user of invalid information
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

// Sends notification to host when someone attends an event
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


// Sends notififcations to attendees when an event is updated
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

// Updates an event and user doc to show that the user is attending the event
const attendEvent = (eventId, hostToken, eventName, pushToken, setData, data) => {
    const eventRef = doc(db, 'events', eventId);
    const userRef = doc(db, 'users', auth.currentUser.uid);

    // Add user to event attendees
    updateDoc(eventRef, {
        attendees: arrayUnion(userRef),
        attendeeTokens: arrayUnion(pushToken),
    });

    // Add event to user's attending array
    updateDoc(userRef, {
        attending: arrayUnion(eventRef)
    });

    // Update data array with new attending info if data array exists
    if (data) {
        const newData = data.map(item => {
            if (item.id === eventId) {
                item.isAttending = true;
                return item
            }
            return item;
        });

        setData(newData);
    }

    // Send notification to event host
    sendNotifications(hostToken, eventName);
}

// Updates an event and user doc to show that the user is no longer attending the event
const unattendEvent = (eventId, pushToken, setData, data) => {
    const eventRef = doc(db, 'events', eventId);
    const userRef = doc(db, 'users', auth.currentUser.uid);

    // Remove user from event attendees
    updateDoc(eventRef, {
        attendees: arrayRemove(userRef),
        attendeeTokens: arrayRemove(pushToken),
    });

    // Remove event from user's attending array
    updateDoc(userRef, {
        attending: arrayRemove(eventRef)
    });

    // Update data array with new attending info if data array exists
    if (data) {
        const newData = data.map(item => {
            if (item.id === eventId) {
                item.isAttending = false;
                return item
            }
            return item;
        })
        setData(newData);
    }
}

// Deletes event and notifies guests
const deleteEvent = async (itemID, tokens, setEventDeleted) => {
    try {
        let eventRef = doc(db, 'events', itemID);
        const userRef = doc(db, 'users', auth.currentUser.uid);
        let ds = await getDoc(eventRef);
        let imageID = ds.data().imageID;

        // Delete event image from storage
        if (imageID) {
            let imageRef = ref(storage, 'event-images/' + imageID);
            await deleteObject(imageRef);
        }

        // Remove event from user's attending and hosting arrays
        updateDoc(userRef, {
            attending: arrayRemove(eventRef),
            hosting: arrayRemove(eventRef)
        });
        
        // Delete the event
        await deleteDoc(eventRef);

        // Notify attendees that the event was deleted
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
        }

        setEventDeleted(true);
        
    } catch (error) {
        console.log('Error deleting event.', error);
    }
};

export { attendEvent, unattendEvent, deleteEvent, deleteAlert,
        inputValidator, inputValidationAlert, sendUpdateNotifications, profileValidator }