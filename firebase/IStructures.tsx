import Team from "../interfaces/ITeam";

export interface IUser {
    name: string,
    team: Team,
}

export const userInitialState: IUser = {
    name: "",
    team: "grey",
};

export type IUsers = Array<IUser>;

export interface IPosition {
    latitude: number,
    longitude: number,
    name: string,
    team: Team
}

export const positionInitialState: IPosition = {
    latitude: 0.0,
    longitude: 0.0,
    name: "",
    team: "grey"
};

export type IPositions = Array<IPosition>;

export interface IGame {
    users: IUsers,
    positions: IPositions,
}

export interface ILocalGame {
    name: string,
    username: IUser,
    redScore: number,
    blueScore: number,
    users: IUsers,
    positions: IPositions,
    loaded: boolean
}

export interface IDatabase {
    games: Array<IGame>
}
