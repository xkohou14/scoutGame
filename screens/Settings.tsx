import * as React from "react";
import {
    createGame,
    createUser,
    getGameName,
    getUsername, getUserTeam, isLoaded, isLogged,
    readGame,
    setGameName,
    setUsername, setUserTeam
} from "../firebase/firebase-handler";
import {Text, View} from "../components/Themed";
import {Button, StyleSheet, TextInput} from "react-native";
import NewPosition from "../components/statsComponents/NewPosition";
import {ILocalGame, IUser, IUsers, userInitialState} from "../firebase/IStructures";
import AsyncStorage from '@react-native-community/async-storage';

export interface ISettingsState {
    pwd: string, /*pwd for editing and scoring*/
    pwdText: string,
    fetching: boolean,
    logged: boolean,
    user: IUser,
    game: string
}

const storageUserKey = 'scoutGameInfoPlayer';

export const storeDataToStorage = async (key,value) => {
    try {
        value.game = getGameName();
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
        alert("Could not store to phone: " + e.toString())
    }
};


export const getStorageData = async (key) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(key) : null;
    } catch(e) {
        alert("Could not read from device: " + e.toString())
    }
};


let initialState: ISettingsState = {
    pwd: "pitanMaster",
    pwdText: "",
    fetching: false,
    logged: false,
    user: userInitialState,
    game: ""
};

export default class Settings extends React.Component <any, ISettingsState> {
    _isMounted = false;
    constructor(props: any) {
        super(props);
        this.fetch_settings = this.fetch_settings.bind(this);
        this.submitBtn = this.submitBtn.bind(this);
        this.submitUser = this.submitUser.bind(this);
        this.submitGame = this.submitGame.bind(this);
        this.createGame = this.createGame.bind(this);


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
        this.setState({fetching: true});

        const data = await getStorageData(storageUserKey)
            .then(res => {
                const data = (res !== null && res !== undefined) ?
                    {name: res.name.toString(), team:  res.team.toString(), game: res.game.toString()}
                    : {...userInitialState, game: ""};
                return data;
            });
        //alert("Data\n" + JSON.stringify(data, null, 2));
        if (this._isMounted) {
            setGameName(data.game);
            setUsername(data.name);
            this.setState({fetching: false, user: {team: data.team, name: data.name}, game: data.game});
        }
    };

    callback(game: ILocalGame, users) {
        let user = game.users.filter(u => u.name === getUsername());
        if ((user.length > 0 && getUsername() !== "")) { // user exists in DB
            alert("User exists \n" + JSON.stringify(user, null, 2));
            setUserTeam(user[0].team);
            this.setState({
                user: {
                    team: user[0].team,
                    name: getUsername()
                },
                fetching: false
            })
        } else { // user does not exist, create them
            if (getUsername().length > 0) {
                const blues = game.users.filter(u => u.team === "blue").length;
                const reds = game.users.filter(u => u.team === "red").length;
                if (reds > blues) {
                    createUser("blue").finally(
                        () => {
                            this.setState({user: {name: getUsername(), team: "blue"}});
                            alert("Storing user \n" + JSON.stringify(this.state.user, null, 2));
                            storeDataToStorage(storageUserKey, this.state.user).then(() => alert("Stored"));
                        }
                    );
                } else {
                    createUser("red").finally(
                        () => {
                            this.setState({user: {name: getUsername(), team: "red"}});
                            alert("Storing user \n" + JSON.stringify(this.state.user, null, 2));
                            storeDataToStorage(storageUserKey, this.state.user).then(() => alert("Stored"));
                        }
                    );
                }
            } else {
                alert(`Loaded game: ${getGameName()}`);
            }
        }
    }

    submitBtn(e) {
        if (this.state.pwdText.trim().toUpperCase() === this.state.pwd.toUpperCase()) {
            this.setState({logged: true});
        }
    }

    async submitUser(e) {
        const delay = (ms:number) => new Promise(res => setTimeout(res, ms));

        this.setState({fetching: true});
        setUsername(this.state.user.name.trim());
        if (!isLoaded() || getGameName().length === 0) {
            alert("Prvně načtěte hru, prosím");
        } else {
            readGame(this.callback)
        }

        delay(7000).then(() => {
            if (this._isMounted)
                this.setState({fetching:false});
        });

    }

    submitGame(e) {
        setGameName(this.state.game.trim());
        readGame(this.callback);
    }

    createGame(e) {
        createGame(this.state.game);
        this.fetch_settings();
    }

    render() {
        const red = <Text style={styles.red}>{this.state.user.name} Red (game: {getGameName()})</Text>;
        const blue = <Text style={styles.blue}>{this.state.user.name} Blue (game: {getGameName()})</Text>;
        const none = <Text style={styles.red}>You are not signed, fill the game and user name</Text>;
        const current = (isLogged()) ?
            (getUserTeam() === "blue" ? blue : red )
            :
            none;
        //alert("Drawing\n" + JSON.stringify(current.props, null, 2) + "\n" + JSON.stringify(this.state, null, 2));
        return (
            <View style={styles.container}>
                {
                    this.state.fetching &&
                        <Text style={styles.title}>Loading...</Text>
                }
                <Text style={styles.title}>Settings</Text>
                <TextInput key={1} placeholder={"Enter game name"} defaultValue={this.state.game}
                           onChangeText={text => {this.setState({game: text})}}/>
                <Text>
                    <Button key={2} title={"Find game"} onPress={this.submitGame}/>
                    {
                        this.state.logged ?
                            <Button key={3} title={"Create game"} onPress={this.createGame}/>
                        :
                            null
                    }
                </Text>

                <TextInput key={4} placeholder={"Enter your name for loading info"} defaultValue={this.state.user.name}
                           onChangeText={text => {this.setState({user: {...this.state.user, name: text}})}}/>
                <Button key={5} title={"Find my name or create player"} onPress={this.submitUser}/>
                {
                    this.state.fetching ?
                        <Text>Fetching...</Text>
                        :
                        current
                }
                <Text style={styles.title}>Admin</Text>
                {
                    this.state.logged ?
                        [
                            <NewPosition key={22} />
                        ]
                        :
                        [
                            <TextInput key={12} placeholder={"Enter password for editions"} onChangeText={text => {this.setState({pwdText: text})}}/>,
                            <Button key={28} title={"Submit"} onPress={this.submitBtn}/>
                        ]
                }
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
