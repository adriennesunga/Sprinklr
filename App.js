import { Expo, LinearGradient } from 'expo';
import React, {Component} from 'react';
import {  StyleSheet,
          Text,
          View,
          Image,
          ScrollView,
          Dimensions,
          Button,
          Alert,
          Modal,
          Picker,
          TouchableHighlight,
          AsyncStorage } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createBottomTabNavigator } from 'react-navigation';
import Swipeout from 'react-native-swipeout';
import Moment from 'react-moment';

let t = require('tcomb-form-native');
let Form = t.form.Form;
let options = {};
let Plant = t.struct({
  name: t.String,
  species: t.maybe(t.String),
  wateringSchedule: t.Date,
  every_X_Days: t.Number
});

class PlantListScreen extends React.Component {


 
  constructor(props) {
    super(props)
    // this._onPressButton = this._onPressButton.bind(this)

    //binds the scope of the class to the function
    this.renderRow = this.renderRow.bind(this)
    this.deletePlant = this.deletePlant.bind(this)
  }

  state = {
    modalVisible: false,
    currentPlant: {name: '', species: '', wateringSchedule: '', every_X_Days: ''},
    plants: [],
    startId: 0
    
  };


  // when the component mounts, set the state of getplantstate
  componentWillMount(){
    this.getPlantState()
  }


  // getting plant state from async storage
  // storage comes out as a string, need to parse it
  getPlantState() {
    var getAsync = AsyncStorage.getItem('@plants').then(plants =>
      this.setState({plants: JSON.parse(plants)}
    ))
  }

  // when a plant is pressed, modal pops up at the currentPlant
  _onPressButton(plant) {
    this.setState({
      modalVisible: true,
      currentPlant: plant
    });
  }

  // deletes whichever plant is selected 
  deletePlant(plant) {
    let newPlantList = this.state.plants.filter(function(el) {
      return el.id !== plant.id
    });

  // changes the state to the new plantlist without the deleted plant
    this.setState({
      plants: newPlantList
    })

    //stores new plantlist without the deleted plant
    this.storePlants(newPlantList)
  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  // creates ID's -- checks to see if no IDs exist , else increment from last plant
  getId() {
    if(this.state.plants.length > 0){
      return this.state.plants.slice(-1)[0].id + 1
    }
    else {
      return this.state.startId
    }
  }

  // function to store plants
  storePlants(plants) {
    AsyncStorage.setItem('@plants', JSON.stringify(plants))
  }


// component for each row
  renderRow(plant){
    let swipeoutBtns = [
      {
        component: <View style={styles.deleteContainer}><Text style={{color: '#fff'}}>Delete</Text></View>,
        onPress: ()=>{this.deletePlant(plant)}
      }
    ]

    return <Swipeout key={plant.id} right={swipeoutBtns} style={{marginTop: 2}} autoClose={true}>
              <View style={styles.plantListCard}>
              <Image source={require('./plant-2.png')} style={styles.image}/>
              <View style={{justifyContent: 'center', flex: 1}}>
                <Text style={{flex: 1, paddingLeft: 5, paddingTop: 5, fontWeight: 'bold', fontSize: 18}}>{plant.name}</Text>
                <Text style={{flex: 1, paddingLeft: 5, fontSize: 14}}>{plant.species}</Text>
              </View>

              <TouchableHighlight
              style={{paddingRight: 10}}
              onPress={this._onPressButton.bind(this, plant)}>
              <Ionicons name={"ios-arrow-forward"} size={30} color={"#007AFF"} />
              </TouchableHighlight>
              </View>
          </Swipeout>
  }

  render() {

    // gets params from the add plant page  (the values that they input the form)
    const otherParam = this.props.navigation.getParam('newPlant', {});



    const modal = ( <Modal animationType="fade" transparent={false}
                            visible={this.state.modalVisible}
                            onRequestClose={() => {
                        alert('Modal has been closed.');
                      }}>
                        <View style={{marginTop: 60}}>
                          <TouchableHighlight onPress={() => {this.setModalVisible(false) }}>
                            <Ionicons name={"ios-arrow-back"} size={30} color={"#007AFF"} style={{paddingLeft: 10}} />
                          </TouchableHighlight>
                          <View style={{justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={{fontSize: 30, textAlign: 'center'}}>{this.state.currentPlant.name}</Text>
                            <Image source={require('./plant-2.png')} style={{width: (dWidth - 50), height: (dWidth - 50)}}/>
                            <Text style={{paddingTop: 20,fontSize: 30, textAlign: 'center'}}>Watering Schedule:</Text>
                            <Text>every  {this.state.currentPlant.every_X_Days} days starting from </Text>
                        {/* moment --- formatting the date */}
                            <Moment format="MMM-DD hh:mm a" style={{paddingTop: 10}} element={Text} >{this.state.currentPlant.wateringSchedule}</Moment>
                          </View>



                        </View>


                                
                      </Modal>)

// make sure that name is not null , do what is in the if statement
    if (otherParam.name) {
    
      // creates a new plant object with the values of the params above
      let newPlant = {id: this.getId(),
                      name: otherParam.name,
                      species: otherParam.species || "",
                      wateringSchedule: otherParam.wateringSchedule || "",
                      every_X_Days: otherParam.every_X_Days}
      let newPlantList = this.state.plants.push(newPlant)

      // resets new parameters to be empty
      this.props.navigation.setParams({newPlant: {}})
      // stores the updated plant list, overwrites old one
      this.storePlants(this.state.plants)
    }


    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {modal}
      <View style={{height: 100, alignItems: 'center', paddingTop: 60, backgroundColor: '#fff'}}>
      <Text style={{color: "black", width: dWidth, textAlign: 'left', fontSize: 33, fontWeight: 'bold', paddingLeft: 10}}>My Plants</Text>
      </View>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {
            this.state.plants.map((l, i) => (
              this.renderRow(l)
            ))
          }
        </ScrollView>
      </View>
    );
  }
}

class AddPlantScreen extends React.Component {

  onPress() {

    // gets value of the inputs of the form 
      var value = this.refs.form.getValue();

      // if the value exists, navigate back to the view plants page and pass in the new plant as parameters
      if (value) {
        this.props.navigation.navigate('View Plants', {
              newPlant: value,
        });
      }
    }

  render() {
    return (

            <ScrollView contentContainerStyle={styles.contentContainer}>

                <Image source={require('./houseplant-bg-1.png')} style={{ width: dWidth, position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}  />

                {/* <LinearGradient colors={['#C4E6FE', '#f6fff2']} start={[0,0]} end={[0,1]} 
                style={{ width: dWidth, position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} /> */}

                <View style={styles.block}>
                
                  <View style={styles.heading}>
                    <Text style={styles.heading__text}>Add a plant</Text>
                  </View>

                  <View style={styles.form}>
                    <Form
                        ref="form"
                        type={Plant}
                        options={options} style={{borderWidth: 10, borderColor:'red'}}
                        />
                        {/*}
                      <Picker
                      // selectedValue={this.state.language}
                      style={{ height: 50 }} selectedValue={(this.state && this.state.pickerValue) || '0'}
                      onValueChange={(value) => {
                        this.setState({pickerValue: value});
                      }}>
                      <Picker.Item label="0" value="0" />
                      <Picker.Item label="1" value="1" />
                      <Picker.Item label="2" value="2" />
                      <Picker.Item label="3" value="3" />
                      <Picker.Item label="4" value="4" />
                      <Picker.Item label="5" value="5" />
                      <Picker.Item label="6" value="6" />
                      <Picker.Item label="7" value="7" />
                      <Picker.Item label="8" value="8" />
                      <Picker.Item label="9" value="9" />
                      <Picker.Item label="10" value="10" />
                      <Picker.Item label="11" value="11" />
                      <Picker.Item label="12" value="12" />
                      <Picker.Item label="13" value="13" />
                      <Picker.Item label="14" value="14" />
                    </Picker>*/}
                  </View>

                  <View style={styles.button__block}>
                      <TouchableHighlight style={styles.button} onPress={this.onPress.bind(this)}   underlayColor='#99d9f4'>
                        <Text style={styles.buttonText}>Save</Text>
                      </TouchableHighlight>
                  </View>

                </View>

                {/*<View style={styles.container}>
        <Form
          ref="form"
          type={Plant}
          options={options}
        />
      <TouchableHighlight style={styles.button} onPress={this.onPress.bind(this)} underlayColor='#99d9f4'>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableHighlight>



      <View>

<Picker
// selectedValue={this.state.language}
style={{ height: 50, width: 100 }} selectedValue={(this.state && this.state.pickerValue) || '0'}
onValueChange={(value) => {
  this.setState({pickerValue: value});
}}>
<Picker.Item label="0" value="0" />
<Picker.Item label="1" value="1" />
<Picker.Item label="2" value="2" />
<Picker.Item label="3" value="3" />
<Picker.Item label="4" value="4" />
<Picker.Item label="5" value="5" />
<Picker.Item label="6" value="6" />
<Picker.Item label="7" value="7" />
<Picker.Item label="8" value="8" />
<Picker.Item label="9" value="9" />
<Picker.Item label="10" value="10" />
<Picker.Item label="11" value="11" />
<Picker.Item label="12" value="12" />
<Picker.Item label="13" value="13" />
<Picker.Item label="14" value="14" />

</Picker></View>


</View>*/}

            </ScrollView>

    );

   
  }
  

}



export default createBottomTabNavigator(
  {
    ["View Plants"]: PlantListScreen,
    ["Add Plant"]: AddPlantScreen,
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, tintColor }) => {
        const { routeName } = navigation.state;
        let iconName;
        if (routeName === 'View Plants') {
          iconName = `ios-images${focused ? '' : '-outline'}`;
        } else if (routeName === 'Add Plant') {
          iconName = `ios-leaf${focused ? '' : '-outline'}`;
        }

        return <Ionicons name={iconName} size={25} color={tintColor} />;
      },
    }),
    tabBarOptions: {
      activeTintColor: '#019875',
      inactiveTintColor: 'gray',
    },
  }
);


const dWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    marginTop: 190,
    opacity: 0.85,
    marginBottom: 12,
    borderWidth: 0,
    borderColor: 'red',
    shadowOffset: { width: 0, height: 18 },
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10
  },
  heading: {
    // flex: 1,
    // padding: 24,
  },
  heading__text: {
    fontWeight: 'bold',
    fontSize: 40,
    paddingTop: 18,
    alignItems: 'center',
    paddingLeft: 55
    
  },
  block: {
    justifyContent: 'space-evenly',
    padding: 24,
    paddingTop: 44,
    width: dWidth,
    flex: 1,
    borderWidth: 0,
    borderColor: 'red'
  },
  button__block: {
    // flex: 1,
    borderWidth: 0,
    borderColor: 'red',
    shadowOffset: { width: 0, height: 14 },
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    justifyContent: 'flex-end'
  },


  deleteContainer: {
    flex: 1,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    paddingVertical: 1,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50
  },
  plantListCard: {
    flexDirection: 'row',
    width: (dWidth - 10),
    alignItems: 'center',
    flex: 1,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    shadowOpacity: 0.75,
    shadowRadius: 1,
    shadowColor: 'black',
    padding: 12,
    shadowOffset: { height: 1, width: 1 }
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    alignSelf: 'center'
  },
  button: {
    height: 36,
    backgroundColor: '#2B4BC0',
    borderColor: '#48BBEC',
    borderWidth: 0,
    // borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  fontTen: {
    fontSize: 10
  }

});