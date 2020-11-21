import * as React from 'react';
import { StyleSheet, TextInput, Button } from 'react-native';

import { Text, View } from '../Themed';
import {IPosition, positionInitialState} from "../../firebase/IStructures";
import {createPosition} from "../../firebase/firebase-handler";

export interface INewPositionState extends IPosition{
    fetching: boolean,
}

const initialState: INewPositionState = {
    fetching: false,
    ...positionInitialState
};

export default class NewPosition extends React.Component <any, INewPositionState> {
    _isMounted = false;
    constructor(props: any) {
        super(props);
        this.fetch_settings = this.fetch_settings.bind(this);
        this.submitBtn = this.submitBtn.bind(this);

        this.state = initialState;
    }

    componentDidMount() {
        this._isMounted = true;
        this.fetch_settings();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    fetch_settings = async () => {
        const delay = (ms:number) => new Promise(res => setTimeout(res, ms));

        this.setState({fetching: true});

        await delay(Math.random() % 3000 + 1500);

        if (this._isMounted) {
            this.setState({fetching: false});
        }
    };

    submitBtn(e) {
        this.fetch_settings();
        createPosition({
            team: this.state.team,
            name: this.state.name,
            latitude: this.state.latitude,
            longitude: this.state.longitude
        });
    }


    render() {
        const loading = this.state.fetching ?
                <Text style={styles.title}>Adding...</Text>
                :
                null;
        return (
            <View>
                {loading}
                <Text style={styles.title}>Insert new position</Text>
                <Text>Name: </Text>
                <TextInput placeholder={"Mendlak"} onChangeText={text => {this.setState({name: text})}}/>
                <Text>Latitude: </Text>
                <TextInput placeholder={"41.40338"} onChangeText={text => {this.setState({latitude: parseFloat(text)})}}/>
                <Text>Longitude:</Text>
                <TextInput placeholder={"2.17403"} onChangeText={text => {this.setState({longitude: parseFloat(text)})}}/>
                <Button title={"Add new position"} onPress={this.submitBtn}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
    blue: {
        color: 'blue',
    },
    red: {
        color: 'red',
    }
});
