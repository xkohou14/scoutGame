import * as firebase from "firebase";
import {firebaseConfig} from "./firebase-config"
import {ILocalGame, IPosition, IPositions, IUser, IUsers, userInitialState} from "./IStructures";

export let localGame: ILocalGame = {
    name: "",
    username: userInitialState,
    redScore: 0,
    blueScore: 0,
    users: [],
    positions: [],
    loaded: false
};

const game_path = "games/";
const user_path = "users/";
const position_path = "positions/";
const score_path = "scores/";

export const setGameName = (g: string) => {
    localGame.name = g;
};
export const getGameName = (): string => {
    return localGame.name;
};

export const setUsername = (g: string) => {
    localGame.username.name = g;
};
export const getUsername = (): string => {
    return localGame.username.name;
};

export const setUserTeam = (t: IUser["team"]) => {
    localGame.username.team = t;
};
export const getUserTeam = (): IUser["team"] => {
    return localGame.username.team;
};
export const getScore = (): {red: number, blue: number} => {
    return {red: localGame.redScore, blue: localGame.blueScore};
};
export const createUser = (flag: IUser["team"]) => {
    setUserTeam(flag);
    return firebase.database().ref(game_path + localGame.name + "/" + user_path + getUsername()).set({
        name: getUsername(),
        team: flag
    });
};

export const getPositons = (): IPositions => {
    return localGame.positions;
};

export const isLoaded = (): boolean => {
    return localGame.loaded;
};
export const isLogged = ():boolean => {
    return isLoaded() && getUsername().length > 0 && getUserTeam() !== "grey";
};

export const createGame = (name:String) => {
    firebase.database().ref(game_path + name).set({
        name: name
    });
    firebase.database().ref(game_path + name + "/" + score_path).set({
        red: 0,
        blue: 0,
    });
};
export const readGame = (callback) => {
    const previous = localGame;
    firebase.database()
        .ref(game_path + localGame.name)
        .once('value')
        .then((snapshot) => {
            let positionsTmp = snapshot.val().positions || [];
            let positions: IPositions = [];
            for (let el in positionsTmp) { // iterate objects and insert them into array
                positions.push({
                    name: positionsTmp[el].name,
                    team: positionsTmp[el].team,
                    latitude: positionsTmp[el].latitude,
                    longitude: positionsTmp[el].longitude
                })
            }
            let usersTmp = snapshot.val().users || [];
            let users: IUsers = [];
            for (let el in usersTmp) { // iterate objects and insert them into array
                users.push({
                    name: usersTmp[el].name,
                    team: usersTmp[el].team
                })
            }
            localGame = {
                ...localGame,
                username: {
                    name: previous.username.name,
                    team: previous.username.team
                },
                blueScore: snapshot.val().scores.blue || 0,
                redScore: snapshot.val().scores.red || 0,
                users: users,
                positions: positions,
                loaded: true,
            };
            callback(localGame, snapshot.val().users);
        });
};
/**
 * Captures or creates position
 * @param position
 */
export const createPosition = (position:IPosition) => {
    if (isLoaded()) {
        alert("Creating/capturing new position\n" + game_path + localGame.name + "/" + position_path + position.name);
        firebase.database().ref(game_path + localGame.name + "/" + position_path + position.name).set({
            ...position
        });
    }
};
export const updateScore = (red: number, blue: number) => {
    if (isLoaded()) {
        firebase.database().ref(game_path + localGame.name + "/" + score_path).set({
            red: red,
            blue: blue,
        });
    }
};

//alert("Initialization of firebase");
firebase.initializeApp(firebaseConfig);

export default firebase;

export const test= () => {
    const previousLocalGame = localGame;
    const markers: IPositions = [
        {latitude: 49.203372776267074,longitude: 16.584417693584413, name: "P1 position", team: "blue"},
        {latitude: 49.204087816477276,longitude: 16.576692934998167, name: "P2", team: "red"},
        {latitude: 49.203281652785115,longitude: 16.573130990079555, name: "P3", team: "red"},
        {latitude: 49.201171635525895,longitude: 16.57564151857248, name: "P4", team: "blue"},
        {latitude: 49.19719659838776,longitude: 16.581080911628167, name: "P5", team: "blue"},
        {latitude: 49.20045819548191,longitude: 16.584431924354714, name: "P6", team: "blue"},
    ];

    localGame = {
        name: "t",
        username: {
            name: "T",
            team: "blue"
        },
        redScore: 10,
        blueScore: 20,
        users: [{
            name: "Testuser 322",
            team: "red"
        }],
        positions: [],
        loaded: true
    };
    const p = localGame;
    createGame("t");
    createUser("blue");
    createPosition(markers[0]);
    createPosition(markers[1]);
    createPosition(markers[2]);
    createPosition(markers[3]);
    createPosition(markers[4]);
    updateScore(5, 3);

    readGame(()=>{
        alert("Test case \n" + JSON.stringify(localGame, null, 2));
        alert("Test case before \n" + JSON.stringify(p, null, 2));
    });

    localGame = previousLocalGame;
}
