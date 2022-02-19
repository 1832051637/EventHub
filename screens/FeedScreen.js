import React, { useContext, useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, FlatList, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, storage, auth } from '../firebase';
import { ref } from 'firebase/storage';
import SearchBar from "../components/SearchBar";
import { getDateString, getTimeString } from '../utils/timestampFormatting';
import style from '../styles/style.js';
import feedStyle from '../styles/feedStyle';
import { UserInfoContext } from '../utils/UserInfoProvider';
import { attendEvent, unattendEvent, deleteAlert } from '../utils/eventUtils';
import LoadingView from '../components/LoadingView';

const FeedScreen = () => {
    const { myGeo, pushToken } = useContext(UserInfoContext);
    const [data, setData] = useState([]);
    const [searchPhrase, setSearchPhrase] = useState("");
    const [clicked, setClicked] = useState(false);
    const [eventDeleted, setEventDeleted] = useState(false);
    const navigation = useNavigation();
    const [refresh, setRefresh] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setEventDeleted(false);
        
        let searchPhraseLower = searchPhrase.toLowerCase();
        let viewEvents = collection(db, "events");
        //let hostedEvents = query(viewEvents, where("host", "==", auth.currentUser.uid));
        let eventQuery;

        eventQuery = viewEvents;

        if (myGeo) {
            eventQuery = query(viewEvents, where("geoLocation", "==", myGeo));
        }

        getDocs(eventQuery).then(docs => {
            let events = [];

            docs.forEach((doc) => {
                let docData = doc.data();
                
                //if (auth.currentUser.uid === docData.host) return;
                if (new Date() > new Date(docData.endTime.seconds * 1000)) return;
                if (docData.attendees.length >= docData.attendeeLimit) return;
                

                const gsReference = ref(storage, docData.image);
                let isAttending = docData.attendees.some((value) => { return value.id === auth.currentUser.uid });

                let event = {
                    id: doc.id,
                    image: docData.image,
                    name: docData.name,
                    description: docData.description,
                    startTime: new Date(docData.startTime.seconds * 1000),
                    endTime: new Date(docData.endTime.seconds * 1000),
                    address: docData.address,
                    eventGeo: docData.geoLocation,
                    host: docData.host,
                    hostToken: docData.hostToken,
                    attendeeTokens: docData.attendeeTokens,
                    isAttending: isAttending,
                };

                let eventName = event.name.toLowerCase();
                let eventDescription = event.description.toLowerCase()

                if (searchPhrase === '' || eventName.includes(searchPhraseLower) ||
                                eventDescription.includes(searchPhraseLower)) {

                   events.push(event);
                }
            });
            
            setData(events.sort((a, b) => (a.startTime > b.startTime) ? 1 : -1));
            setLoading(false);
            setRefresh(false);
        })
    }, [searchPhrase, myGeo, eventDeleted, refresh])

    const EventCard = ({ item }) => {
        const displayDate = getDateString(item.startTime, item.endTime);
        const displayTime = getTimeString(item.startTime) + ' - ' + getTimeString(item.endTime);

        return (
            <TouchableOpacity
                style={feedStyle.card}
                onPress={() => {
                    navigation.push("Event Details", {eventID: item.id})
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
                                onPress={() => { deleteAlert(item.id, item.name, item.attendeeTokens, setEventDeleted) }}
                            >
                                <MaterialCommunityIcons name="delete" size={26} color='rgb(200, 0, 0)' />
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
                refreshing = {refresh}
                onRefresh = {() => setRefresh(true)}
            />
        </SafeAreaView>
    );
};

export default FeedScreen;
