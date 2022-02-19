import React from 'react';
import {  View, ActivityIndicator } from 'react-native';
import style from '../styles/style';

export default LoadingView = () => {
    return (
        <View style={style.container}>
            <ActivityIndicator size="large" color="#0782F8" />
        </View>
    );
}