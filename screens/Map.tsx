import React, {useEffect} from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  PermissionsAndroid
} from "react-native";
import MapView, {
  Marker,
  PROVIDER_GOOGLE
} from "react-native-maps";
import Geolocation from 'react-native-geolocation-service';

export interface IMarker {
  name: string,
  color: "red"|"blue",
  latitude: number,
  longitude: number,
}

export interface IMapState {
  position: {latitude: number, longitude: number},
  markers: Array<IMarker>,
  hasLocationPermission: boolean,
  fetching: boolean,
  distance: number,
  watchID: number,
}

export const initialState: IMapState = {
  position: {latitude: 49.203372776267074,longitude: 16.584417693584413},
  markers: [],
  hasLocationPermission: false,
  fetching: false,
  distance: 500,
  watchID: -1,
};

const markers: Array<IMarker> = [
  {latitude: 49.203372776267074,longitude: 16.584417693584413, name: "P1", color: "blue"},
  {latitude: 49.204087816477276,longitude: 16.576692934998167, name: "P2", color: "red"},
  {latitude: 49.203281652785115,longitude: 16.573130990079555, name: "P3", color: "red"},
  {latitude: 49.201171635525895,longitude: 16.57564151857248, name: "P4", color: "blue"},
  {latitude: 49.19719659838776,longitude: 16.581080911628167, name: "P5", color: "blue"},
  {latitude: 49.20045819548191,longitude: 16.584431924354714, name: "P6", color: "blue"},
];

export default class Map extends React.Component <any, IMapState> {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.fetch_settings = this.fetch_settings.bind(this);
    this.fetchPosition = this.fetchPosition.bind(this);

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
    const nearestMarker = (lat: number|null = null, lon: number|null = null): IMarker => {
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
      }, {color: "blue", latitude: 0, longitude: 0, name: "Beginning of system"})
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
        )
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

    await delay(Math.random() % 3000 + 1500);

    if (this._isMounted) {
      this.setState({...this.state, fetching: false, markers: markers});
    }
  };

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
                    //alert("Android device permission " + granted) // just to ensure that permissions were granted
                    /*this.fetchPosition();*/
                  });
                }
              }}
          >
            {
              this.state.markers.map((el, index) =>
                  <Marker
                      key={index}
                      title={el.name}
                      draggable={false}
                      pinColor={el.color}
                      coordinate={{latitude: el.latitude, longitude: el.longitude}}
                  />
              )
            }
          </MapView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.bubble, styles.button]}>
              {
                this.state.fetching ?
                    <Text>Loading...</Text>
                  :
                    <Text>{this.state.distance.toFixed(2)} m </Text>
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
