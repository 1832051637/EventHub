import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import style from '../styles/style.js';

const EditEventScreen = () => {

    return (
        <KeyboardAwareScrollView contentContainerStyle={style.container}>
        </KeyboardAwareScrollView >
    );
};

export default EditEventScreen;
