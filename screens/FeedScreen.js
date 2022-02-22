import React, { useContext, useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, FlatList, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { collection, getDocs, query, where, orderBy, limit, startAfter } from "firebase/firestore";
import { db, auth } from '../firebase';
import SearchBar from "../components/SearchBar";
import { getDateString, getTimeString } from '../utils/timestampFormatting';
import style from '../styles/style.js';
import feedStyle from '../styles/feedStyle';
import { UserInfoContext } from '../utils/UserInfoProvider';
import { attendEvent, unattendEvent } from '../utils/eventUtils';
import LoadingView from '../components/LoadingView';
import { useIsFocused } from '@react-navigation/native';
import Geocoder from "react-native-geocoding";
import Geohash from 'latlon-geohash';

const FeedScreen = () => {
    const navigation = useNavigation();
    const { myGeo, setMyGeo, setLocation, originalGeo, pushToken } = useContext(UserInfoContext);
    const [data, setData] = useState([]);
    const [lastSnapshot, setLastSnapshot] = useState(null);
    const [searchPhrase, setSearchPhrase] = useState("");
    const [clicked, setClicked] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [loading, setLoading] = useState(true);
    const defaultGeo = '9q9';
    const eventsToLoad = 3;
    const isFocused = useIsFocused();
    Geocoder.init("AIzaSyAKuGciNBsh0rJiuXAvza2LKTl5JWyxUbA", { language: "en" });

    useEffect(async () => {
        if (searchPhrase === '') {
            setMyGeo(originalGeo);
            await loadMore();

        } else {
            //********************************************************************
            // IMPORTANT: this function is using too many Geocoding API request.
            // Whenever the searchPhrase is not empty string, it requests the API.
            // And it may exceed the free limits. So I just commented it out.
            //********************************************************************
            // await getLocationFromSearch();

            await searchEvents();
        }

        setLoading(false);
        setRefresh(false);
    }, [searchPhrase, myGeo, refresh])

    useEffect(async () => {
        setRefresh(true);
    }, [isFocused])

    const loadMore = async () => {
        let allEvents = collection(db, "events");
        let events = [];
        let geo = myGeo ? myGeo : defaultGeo;
        let eventQuery;
        let replaceData = false;

        if (refresh || !lastSnapshot) {
            replaceData = true;
            eventQuery = query(allEvents,
                where("endTime", ">=", new Date()),
                where("geoLocation", "==", geo),
                orderBy("endTime"),
                orderBy("startTime"),
                limit(eventsToLoad));

        } else {
            eventQuery = query(allEvents,
                where("endTime", ">=", new Date()),
                where("geoLocation", "==", geo),
                orderBy("endTime"),
                orderBy("startTime"),
                startAfter(lastSnapshot),
                limit(eventsToLoad));
        }

        let eventSnaps = await getDocs(eventQuery);

        if (eventSnaps.docs.length === 0) return;

        setLastSnapshot(eventSnaps.docs[eventSnaps.docs.length - 1]);

        eventSnaps.forEach((eventSnap) => {
            let eventData = eventSnap.data();

            if (eventData.attendees.length >= eventData.attendeeLimit) return;
            let isAttending = eventData.attendees.some((value) => { return value.id === auth.currentUser.uid });

            events.push({
                id: eventSnap.id,
                image: eventData.image,
                name: eventData.name,
                description: eventData.description,
                startTime: new Date(eventData.startTime.seconds * 1000),
                endTime: new Date(eventData.endTime.seconds * 1000),
                address: eventData.address,
                eventGeo: eventData.geoLocation,
                host: eventData.host,
                hostToken: eventData.hostToken,
                attendeeTokens: eventData.attendeeTokens,
                isAttending: isAttending,
            });
        });

        if (replaceData) {
            setData(events);
        } else {
            setData([...data, ...events]);
        }
    };

    const getLocationFromSearch = async () => {
        try {
            const json = await Geocoder.from(searchPhrase);
            const newLocation = json.results[0].geometry.location;
            setMyGeo(Geohash.encode(newLocation.lat, newLocation.lng, [3]));

            setLocation({
                latitude: newLocation.lat,
                longitude: newLocation.lng
            })

        } catch (error) {
            setMyGeo("");
            console.log("Error in searching by location " + error);
        }
    }

    const searchEvents = async () => {
        setLastSnapshot(null);
        let searchPhraseLower = searchPhrase.toLowerCase();
        let allEvents = collection(db, "events");
        let events = [];
        let geo = myGeo ? myGeo : defaultGeo;
        let searchEvents = query(allEvents,
            where("endTime", ">=", new Date()),
            where("geoLocation", "==", geo),
            orderBy("endTime"),
            orderBy("startTime"));

        let eventSnaps = await getDocs(searchEvents);

        eventSnaps.forEach((eventSnap) => {
            let eventData = eventSnap.data();

            if (eventData.attendees.length >= eventData.attendeeLimit) return;

            let eventName = eventData.name.toLowerCase();
            let eventDescription = eventData.description.toLowerCase();
            let eventLocation = eventData.geoLocation;

            if (eventName.includes(searchPhraseLower) || eventDescription.includes(searchPhraseLower) || eventLocation == myGeo) {
                let isAttending = eventData.attendees.some((value) => { return value.id === auth.currentUser.uid });
                events.push({
                    id: eventSnap.id,
                    image: eventData.image,
                    name: eventData.name,
                    description: eventData.description,
                    startTime: new Date(eventData.startTime.seconds * 1000),
                    endTime: new Date(eventData.endTime.seconds * 1000),
                    address: eventData.address,
                    eventGeo: eventData.geoLocation,
                    host: eventData.host,
                    hostToken: eventData.hostToken,
                    attendeeTokens: eventData.attendeeTokens,
                    isAttending: isAttending,
                });
            }
        });

        setData(events);
    }

    const EventCard = ({ item }) => {
        const displayDate = getDateString(item.startTime, item.endTime);
        const displayTime = getTimeString(item.startTime) + ' - ' + getTimeString(item.endTime);

        return (
            <TouchableOpacity
                style={feedStyle.card}
                onPress={() => {
                    navigation.push("Event Details", { eventID: item.id, host: item.host })
                }}
            >
                {feedStyle.image && <Image
                    source={{
                        uri: item.image
                    }}
                    style={feedStyle.image}
                    resizeMode={'cover'}
                />}
                <View style={feedStyle.body}>
                    <View style={feedStyle.heading}>
                        <Text style={feedStyle.title}>{item.name}</Text>
                        {/* If it is current users event, show delete button otherwise attend/unattend */}
                        {
                            auth.currentUser.uid === item.host
                                ?
                                <TouchableOpacity
                                    onPress={() => {
                                        navigation.push("Edit Event", { eventID: item.id })
                                    }}
                                >
                                    <MaterialCommunityIcons name="pencil" size={26} color='rgb(100, 100, 100)' />
                                </TouchableOpacity>
                                :
                                <TouchableOpacity
                                    onPress={() => {
                                        item.isAttending
                                            ? unattendEvent(item.id, pushToken, setData, data)
                                            : attendEvent(item.id, item.hostToken, item.name, pushToken, setData, data);
                                    }}
                                >
                                    {item.isAttending
                                        ? <MaterialCommunityIcons name="minus" size={26} color='rgb(100, 100, 100)' />
                                        : <MaterialCommunityIcons name="plus" size={26} color='rgb(100, 100, 100)' />
                                    }
                                </TouchableOpacity>
                        }
                    </View>
                    <Text style={feedStyle.timestamp}>
                        <MaterialCommunityIcons name="clock-outline" size={16} />
                        {' '}{displayDate} at {displayTime}
                    </Text>
                    {item.address && <Text style={feedStyle.location}>
                        <MaterialCommunityIcons name="map-marker-outline" size={16} />
                        {' '}{item.address}
                    </Text>}
                    <Text numberOfLines={2} style={feedStyle.description}>{item.description}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    if (loading) {
        return (<LoadingView />)
    }

    // Home screen GUI
    return (
        <SafeAreaView style={style.container}>
            <SearchBar
                searchPhrase={searchPhrase}
                setSearchPhrase={setSearchPhrase}
                clicked={clicked}
                setClicked={setClicked}
            />
            <FlatList
                style={feedStyle.feed}
                data={data}
                renderItem={EventCard}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => (<View style={feedStyle.separator} />)}
                ListFooterComponent={() => (<View style={feedStyle.footer} />)}
                refreshing={refresh}
                onRefresh={() => setRefresh(true)}
                onEndReached={() => {
                    if (searchPhrase == '') {
                        loadMore();
                    }
                }}
                onEndReachedThreshold={0.1}
            />
        </SafeAreaView>
    );
};

export default FeedScreen;
