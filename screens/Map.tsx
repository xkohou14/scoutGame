import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  PermissionsAndroid, Button
} from "react-native";
import MapView, {
  Marker,
  PROVIDER_GOOGLE
} from "react-native-maps";
import Geolocation from 'react-native-geolocation-service';
import Team from "../interfaces/ITeam";
import {IPosition, IPositions} from "../firebase/IStructures";
import {createPosition, getPositons, getUserTeam, isLoaded, isLogged, readGame} from "../firebase/firebase-handler";

export interface IMarker {
  name: string,
  color: Team,
  latitude: number,
  longitude: number,
}

const defaultMarker: IPosition = {team: "blue", latitude: 0, longitude: 0, name: "Middle of the Earth"};

export interface IMapState {
  position: {latitude: number, longitude: number},
  markers: IPositions,
  hasLocationPermission: boolean,
  fetching: boolean,
  distance: number,
  nearestMarker: IPosition,
  watchID: number,
}

export const initialState: IMapState = {
  position: {latitude: 49.203372776267074,longitude: 16.584417693584413},
  markers: [],
  hasLocationPermission: false,
  fetching: false,
  distance: 500,
  nearestMarker: defaultMarker,
  watchID: -1,
};

const markers: IPositions = [
  {latitude: 49.203372776267074,longitude: 16.584417693584413, name: "TP1 position", team: "blue"},
  {latitude: 49.204087816477276,longitude: 16.576692934998167, name: "TP2", team: "red"},
  {latitude: 49.203281652785115,longitude: 16.573130990079555, name: "TP3", team: "red"},
  {latitude: 49.201171635525895,longitude: 16.57564151857248, name: "TP4", team: "blue"},
  {latitude: 49.19719659838776,longitude: 16.581080911628167, name: "TP5", team: "blue"},
  {latitude: 49.20045819548191,longitude: 16.584431924354714, name: "TP6", team: "blue"},
];

export default class Map extends React.Component <any, IMapState> {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.fetch_settings = this.fetch_settings.bind(this);
    this.fetchPosition = this.fetchPosition.bind(this);
    this.canCapture = this.canCapture.bind(this);

    this.state = initialState;
  }

  fetchPosition () {
    const distanceBetweenPoints = (lat1:number, lon1:number, lat2:number, lon2:number, unit: string = "K"):number => {
      const R = 6371e3; // metres
      const φ1 = lat1 * Math.PI/180; // φ, λ in radians
      const φ2 = lat2 * Math.PI/180;
      const Δφ = (lat2-lat1) * Math.PI/180;
      const Δλ = (lon2-lon1) * Math.PI/180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c; // in metres
    };
    const nearestMarker = (lat: number|null = null, lon: number|null = null): IPosition => {
      let latitude, longitude;
      if (lat && lon) {
        latitude = lat;
        longitude = lon;
      } else {
        latitude = this.state.position.latitude;
        longitude = this.state.position.longitude;
      }
      return this.state.markers.reduce((l, r) => {
        const lDis = distanceBetweenPoints(l.latitude, l.longitude, latitude, longitude);
        const rDis = distanceBetweenPoints(r.latitude, r.longitude, latitude, longitude);
        if (lDis < rDis) {
          return l;
        } else {
          return r;
        }
      }, defaultMarker)
    };
    const calculate = (position) => {
      const nearest = nearestMarker(position.coords.latitude, position.coords.longitude);
      //alert("Position " + position.coords.latitude + " " + position.coords.longitude + " " + nearest.name + " " + this.state.markers.length);

      this.setState({
        ...this.state,
        position: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        },
        distance: distanceBetweenPoints(
            nearest.latitude,
            nearest.longitude,
            position.coords.latitude,
            position.coords.longitude
        ),
        nearestMarker: nearest,
      })
    };

    if (this.state.hasLocationPermission) {
      const options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 6000000 };
     navigator.geolocation.getCurrentPosition(
        calculate
        ,
        (error) => {
          // See error code charts below.
          alert(error.code + " " + error.message);
        },
        options
      );
      const watch = navigator.geolocation.watchPosition(
          calculate,
          error => {alert("Watch position error: " + error.code + " - " + error.message)},
          options);
      alert("Permissions for LOCATION granted");
      this.setState({
        watchID: watch,
      })
    }
  }

  componentDidMount() {
    this._isMounted  = true;
    this.fetch_settings().then(res => {
      if (Platform.OS === "ios") {
        Geolocation.requestAuthorization("whenInUse").then(
            result => {
              if (result !== "granted") {
                alert("Permissions are not granted")
              }
            }
        ).catch(err => {alert("Geolocation.requestAuthorization IOS error " + err)});
      }
      if (this.state.hasLocationPermission) {
        this.fetchPosition();
      }
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
    if (this.state.watchID !== -1) {
     navigator.geolocation.clearWatch(this.state.watchID);
     Geolocation.stopObserving();
    }
  }

  fetch_settings = async () => {
    const delay = (ms:number) => new Promise(res => setTimeout(res, ms));

    this.setState({...this.state, fetching: true});

    /*await delay(Math.random() % 3000 + 1500);*/
    if (isLoaded()) {
      readGame((val, u) => {
        //alert(JSON.stringify(getPositons(), null, 2));
        if (this._isMounted)
          this.setState({...this.state, fetching: false, markers: getPositons()});
      });
    } else {
      if (this._isMounted)
        this.setState({fetching: false});
    }
  };

  canCapture(): boolean {
    return isLogged() && this.state.distance < 100.00; // less than 100 metres
  }

  render() {
    return (
        <View style={styles.container}>
          <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              showsUserLocation={true}
              zoomEnabled
              showsMyLocationButton={true}
              followsUserLocation
              loadingEnabled
              region={{
                latitude: 49.20236768498567,
                longitude: 16.581798188069918,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02
              }}
              onMapReady={() => {
                if (Platform.OS === "android") {
                  PermissionsAndroid.request(
                      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                  ).then(granted => {
                    this.setState({hasLocationPermission: true});
                  });
                }
              }}
          >
            {
              this.state.markers.length ?
                  this.state.markers.map((el, index) =>
                    <Marker
                        key={index}
                        title={el.name}
                        draggable={false}
                        pinColor={el.team}
                        coordinate={{latitude: el.latitude, longitude: el.longitude}}
                    />
                ) : null
            }
          </MapView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.bubble, styles.button]}>
              {
                this.state.fetching ?
                    <Text>Loading...</Text>
                  :
                    this.canCapture() ?
                      <Button key={1} title={`Capture point ${this.state.nearestMarker!.name}`} onPress={() => {
                        createPosition({
                          ...this.state.nearestMarker!,
                          team: getUserTeam()
                        });
                        this.fetch_settings();
                      }
                      }/>
                      :
                      <Text onPress={this.fetch_settings}>
                        Distance to {this.state.nearestMarker!.name}: {this.state.distance.toFixed(2)} m
                        (for capturing you have to be signed)
                        click for Refresh
                      </Text>
              }
            </TouchableOpacity>
          </View>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  bubble: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20
  },
  latlng: {
    width: 200,
    alignItems: "stretch"
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: "center",
    marginHorizontal: 10
  },
  buttonContainer: {
    flexDirection: "row",
    marginVertical: 20,
    backgroundColor: "transparent"
  }
});
