import * as React from 'react';
import { StyleSheet, TextInput, Button } from 'react-native';

import { Text, View, ScrollView } from '../components/Themed';
import NewPosition from "../components/statsComponents/NewPosition";

export interface IStatsState {
  pwd: string, /*pwd for editing and scoring*/
  pwdText: string,
  fetching: boolean,
  logged: boolean,
  flags: number,
  blues: number,
  bluePoints: number,
  reds: number,
  redPoints: number,
}

const initialState: IStatsState = {
  pwd: "pitanMaster",
  pwdText: "",
  fetching: false,
  logged: false,
  flags: 13,
  blues: 5,
  bluePoints: 20,
  reds: 8,
  redPoints: 15,
};

export default class Stats extends React.Component <any, IStatsState> {
  _isMounted = false;
  constructor(props: any) {
    super(props);
    this.fetch_settings = this.fetch_settings.bind(this);
    this.submitBtn = this.submitBtn.bind(this);
    this.submitScore = this.submitScore.bind(this);

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
    if (this.state.pwdText.trim().toUpperCase() === this.state.pwd.toUpperCase()) {
      this.setState({logged: true});
    }
  }

  submitScore(e) {
    this.fetch_settings();
  }

  render() {
    const red = <Text style={styles.red}>Red</Text>;
    const blue = <Text style={styles.blue}>Blue</Text>;
    return (
      <View style={styles.container}>
        {
          this.state.fetching ?
              <Text style={styles.title}>Loading...</Text>
              :
              null
        }
        <Text style={styles.title}>Stats</Text>
        <Text>
          You are signed to {blue}/{red} team.
        </Text>
        <Text>You can find <Text style={styles.title}>{this.state.flags}</Text> flags in the game</Text>
        <Text><Text style={styles.title}>{blue}</Text> has actually <Text style={styles.title}>{this.state.blues}</Text> flags</Text>
        <Text><Text style={styles.title}>{red}</Text> has actually <Text style={styles.title}>{this.state.reds}</Text> flags</Text>
        <Text style={styles.separator}/>
        <Text style={styles.title}>Score</Text>
        <Text><Text style={styles.title}>{blue}</Text> : <Text style={styles.title}>{this.state.bluePoints}</Text></Text>
        <Text><Text style={styles.title}>{red}</Text> : <Text style={styles.title}>{this.state.redPoints}</Text></Text>
        {
          this.state.logged ?
                [
                    <Button key={1} title={"Count score"} onPress={this.submitScore}/>,
                    <NewPosition key={2} />
                ]
              :
              [
                <TextInput key={1} placeholder={"Enter password for editions"} onChangeText={text => {this.setState({pwdText: text})}}/>,
                <Button key={2} title={"Submit"} onPress={this.submitBtn}/>
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
