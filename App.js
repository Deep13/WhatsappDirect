/* eslint-disable prettier/prettier */
//import liraries
import React, { Component, useEffect, useState, memo } from 'react';

import {
  SafeAreaView,
  Platform,
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  FlatList,
  TouchableOpacity,
  Linking,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import CallLogs from 'react-native-call-log';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  TestIds,
  AdEventType,
} from 'react-native-google-mobile-ads';
// create a component
const interstitial = InterstitialAd.createForAdRequest(
  'ca-app-pub-4717579333914549/1991434018',
);
import PhoneInput from 'react-native-phone-number-input'

const App = () => {
  const [listData, setListDate] = useState([]);
  const [numberM, setnumberM] = useState(null);
  const [loading, setloading] = useState(true);


  // useEffect(() => {
  //   console.log(listData.slice(0, 30))
  // }, [listData])
  useEffect(() => {
    const fetchData = async () => {
      const value = await AsyncStorage.getItem('call_list');
      if (value) {
        // setListDate(JSON.parse(value));
        let list = JSON.parse(value).slice(0, 30)
        setListDate(list)
      }
      if (Platform.OS != 'ios') {
        try {
          //Ask for runtime permission
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
            {
              title: 'Whatsapp Message',
              message: 'Access your call logs',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            CallLogs.loadAll()
              .then(async c => {
                // const uniqueMap = new Map();
                // c.forEach(x => {
                //   uniqueMap.set(x.phoneNumber, { name: x.name, phoneNumber: x.phoneNumber });
                // });
                // const unique = Array.from(uniqueMap.values());
                let unique = [
                  ...new Set(
                    c.map(x => {
                      return { name: x.name, phoneNumber: x.phoneNumber };
                    }),
                  ),
                ];  // this is process heavy
                setListDate(unique.slice(0, 30));
                await AsyncStorage.setItem('call_list', JSON.stringify(unique));
                setloading(false);
              })
              .catch(error => {
                console.log('error', error);
                setloading(false);
              });
          } else {
            alert('Call Log permission denied');
          }
        } catch (e) {
          alert(e);
        }
      } else {
        alert('Sorry! You can’t get call logs because of the security concern');
      }
    }
    fetchData();
    const unsubscribe = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        interstitial.show();
      },
    );

    // Unsubscribe from events on unmount
    return unsubscribe;
  }, []);

  const ItemView = ({ item }) => {
    return (
      // FlatList Item
      <View>
        <TouchableOpacity
          style={styles.textStyle}
          onPress={() => {
            interstitial.load();
            Linking.openURL(
              'whatsapp://send?text=hello&phone=' + item.phoneNumber,
            );
          }}>
          <Text style={styles.textStyle}>
            {item.name && `${item.name}: `}
            {item.phoneNumber}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  const ItemSeparatorView = () => {
    return (
      // FlatList Item Separator
      <View
        style={{
          height: 0.5,
          width: '100%',
          backgroundColor: '#C8C8C8',
        }}
      />
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#198873" />
      <View style={{ backgroundColor: 'white' }}>
        <BannerAd
          unitId="ca-app-pub-4717579333914549/6371879762"
          size={BannerAdSize.FULL_BANNER}
        />
      </View>
      <View style={{ paddingBottom: 100 }}>
        <View
          style={{
            backgroundColor: '#198873',
            paddingTop: 50,
            paddingBottom: 80,
          }}>
          <Text style={styles.headText}>Whatsapp message with just number</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            margin: 20,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 10,
            marginTop: -50,
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 16,
          }}>
          {/* <TextInput
            style={{
              backgroundColor: 'rgba(0,0,0,0.1)',
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
              color: 'black',
              padding: 10,
              flex: 1,
              height: 50,
            }}
            placeholder="Input number to chat"
            placeholderTextColor="black"
            value={numberM}
            onChangeText={text => setnumberM(text)}
          /> */}
          <PhoneInput
            // ref={}
            textInputStyle={{
              backgroundColor: 'rgba(0,0,0,0.1)',
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8,
              color: 'black',
              flex: 1,
              height: 50,
            }}
            containerStyle={{
              padding: 0,
              flex: 1,
              height: 50,
            }}

            defaultValue={numberM}
            defaultCode="IN"
            layout="first"
            placeholder="Input number to chat"
            placeholderTextColor="black"
            // onChangeText={text => setnumberM(text)}
            onChangeFormattedText={(text) => {
              // setFormattedValue(text);
              setnumberM(text)
            }}
            withDarkTheme
            withShadow
          />
          <TouchableOpacity
            onPress={() => {
              if (/^\+[1-9]{1}[0-9]{1}[0-9]{10}$/.test(numberM)) {
                interstitial.load();
                Linking.openURL('whatsapp://send?text=hello&phone=' + numberM);
              } else {
                Alert.alert('Provide valid phone number with country code');
              }
            }}
            style={{
              backgroundColor: '#1ad741',
              padding: 10,
              marginLeft: 10,
              height: 50,
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{ color: 'white', textAlignVertical: 'center' }}>
              Chat
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.titleText, { marginBottom: 20 }]}>
          Click on phone number to open whatsapp chat
        </Text>
        {loading && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
            <Text style={[styles.titleText, { color: 'black' }]}>
              Updating call list...
            </Text>
            <ActivityIndicator />
          </View>
        )}
        <FlatList
          data={listData}
          showsVerticalScrollIndicator={true}
          //data defined in constructor
          ItemSeparatorComponent={ItemSeparatorView}
          //Item Separator View

          renderItem={ItemView}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          backgroundColor: 'white',
        }}>
        <BannerAd
          unitId="ca-app-pub-4717579333914549/8942202787"
          size={BannerAdSize.FULL_BANNER}
        />
      </View>
    </SafeAreaView>
  );
};

export default memo(App)

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headText: {
    fontSize: 30,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
    paddingHorizontal: 20,
  },
  titleText: {
    fontSize: 18,
    textAlign: 'center',
    color: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 20,
  },
  textStyle: {
    fontSize: 20,
    margin: 10,
    color: 'black',
  },
});
