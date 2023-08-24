import React, {useState, useEffect} from 'react';
import { Text, View, StyleSheet, FlatList, TouchableOpacity, Dimensions, Animated, SafeAreaView} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Stopwatch } from 'react-native-stopwatch-timer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

SplashScreen.preventAutoHideAsync(); 

/* My memory game app's theme is matching popular Pop and R&B Artist's faces with their most iconic album covers. It features Pink Floyd's Dark Side of the Moon, Whitney Houston's self-titled album, The Miseducation of Lauryn Hill, Lil Uzi Vert's LUV Is Rage 2, Marvin Gaye's What's Going On, and Michael Jackson's Thriller. I am using a FlatList to render a custom component titled "Item", which represents each memory card. I am also importing and utilizing animated in multiple instances. When the user first presses "Play", a countdown will animate before the game starts so the user can prepare to beat their high score. Additionally I have an animated value that interpolates when the user clicks on a flipped over card that shows a cool animation where the card flips over. When the user flips over two cards, they will disappear if the cards are a match. If they are not a match, the user must press the flip button to flip the cards back over. While the round is going, a Stopwatch timer from react-native-stopwatch-timer is running to keep track of their time. After the user flips over all the cards, they are sent to a seperate screen that displays their current time for that match and their best time. A trumpet sound also plays. The best time is saved to local storage via Async Storage. Overall, the app is simple but effective in being a fun memory game for fans of music. */

/* LIMITATION #1: The user is sometimes able to break the app when they flip three cards at once. This is because the flipCount does not update until the flipping card animation is completed. The only way the user can play this app is when waiting for one card to flip completely over before flipping another. To (somewhat) remedy this, I have shortened the animation time from 400ms to 50ms so hopefully the user is not able to flip over three cards within this time period. Unfortunately, doing this also means that the cards "disappear" when matched faster than I would like them too (Ideally, they would linger on the screen for a little while longer before disappearing).

  LIMITATION #2: Occasionally and very rarely, the async storage high score save will cease to work altogther. When this happens, the user is unable to see the final screen of the game upon finishing matching all the cards. I do not know why this happens, but for this reason, I have implemented a "Reset High Score" button on the main menu which clears AsyncStorage to solve this issue.

  LIMITATION #3: Rarely, certain Images don't load. 
 */

export default function App() {

  const [screen, setScreen] = React.useState(0);
  const stopwatchTime = React.useRef();
  const [isStopwatchStart, setIsStopwatchStart] = useState(false);
  const [resetStopwatch, setResetStopwatch] = useState(false);
  const [count, setCount] = useState('3');
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, newHighScore] = useState();
  const [textanimation, setTextAnimation] = useState(new Animated.Value(0));
  const [memoryArray, setMemoryArray] = React.useState([]);
  const [sound, setSound] = React.useState();

  const storeHighScore = async (newvalue) => {
    try {
      const jsonValue = JSON.stringify(newvalue)
      await AsyncStorage.setItem('highscore', jsonValue)
    } catch (e) {
      // saving error
      }
  }

  const setHighScore = async () => {
    try {
      const value = await AsyncStorage.getItem('highscore');
      if (value !== null && value !== undefined && JSON.parse(value) != 0) {
      newHighScore(JSON.parse(value));
     } else {
       newHighScore(Number.MAX_SAFE_INTEGER); 
      }
    } catch(e) {
      // error reading value
      }
  };

  function toMilliseconds(time) {
   
    let milli = "";
    let sec = "";
    let mins = "";
    let hour = "";
    let count = 0;

    for (var i = 0; i < time.toString().length; i++) {
      if (time.toString().substring(i, i + 1) != ":" && count == 0) {
        hour += time.toString().substring(i, i + 1);
      } else if (time.toString().substring(i, i + 1) == ':') {
        count++;
        }
      if (time.substring(i, i + 1) != ":" && count == 1) {
        mins += time.toString().substring(i, i + 1);
      }
      if (time.substring(i, i + 1) != ":" && count == 2) {
        sec += time.toString().substring(i, i + 1);
      }
      if (time.substring(i, i + 1) != ":" && count == 3) {
        milli += time.toString().substring(i, i + 1);
      }
    }

    let totalTime = parseInt(milli) + (parseInt(sec) * 1000) + (parseInt(mins) * 1000 * 60) + (parseInt(hour) * 1000 * 60 * 60);
    
    return totalTime;
  }

  const readysetgo = async () => {
    setCount('3');
    Animated.timing(textanimation, {
      toValue: 1,
      duration: 500
    }).start (() => {
      Animated.timing(textanimation, {
        toValue: 0,
        duration: 500
      }).start(() => {
        setCount('2')
        Animated.timing(textanimation, {
          toValue: 1,
          duration: 500
        }).start (() => {
          Animated.timing(textanimation, {
            toValue: 0,
            duration: 500
          }).start(() =>{
            setCount('1')
            Animated.timing(textanimation, {
              toValue: 1,
              duration: 500
            }).start(() => {
              Animated.timing(textanimation, {
                toValue: 0,
                duration: 500
              }).start(async () => {
                setCount('Go!')
                Animated.timing(textanimation, {
                  toValue: 1,
                  duration: 500
                }).start(() => {
                  Animated.timing(textanimation, {
                    toValue: 0,
                    duration: 500
                  }).start(() => {
                    setScreen(1);
                    setCount('3');
                  })
                })
              })
            })
          })     
        })      
      })
    })
  }

  const textcolor = 
    textanimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgb(25, 25, 25)', 'rgb(244, 243, 244)']
    })
  
  function shuffleArray (array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  async function playSound(s) { //Async Function that Plays Soundbites
    if (s == 'victory') {
      const { sound } = await Audio.Sound.createAsync(require('./assets/trumpet.mp3'));
      setSound(sound);
      await sound.playAsync();
      }       
  }

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  function checkAns() {
    let flippedCards = [];
    let tempMemArray = [...memoryArray];
    var indexA = -1;
    var indexB = -1;
    for (var i = 0; i < memoryArray.length; i++) {
      if (tempMemArray[i].covered == 0 && tempMemArray[i].collected == 0) {
        flippedCards.push(tempMemArray[i]);
        if (indexA == -1) {
          indexA = i;
        } else {
          indexB = i;
        }
      }
    }

    if (flippedCards[0].matchID == flippedCards[1].matchID) { //Match!
      tempMemArray[indexA].collected = 1;
      tempMemArray[indexB].collected = 1;
      tempMemArray[indexA].disabled = true;
      tempMemArray[indexB].disabled = true;
      setMemoryArray(tempMemArray);
      let gameFinished = true;
      for (var j = 0; j < tempMemArray.length; j++) {
        if (tempMemArray[j].collected != 1) {
          gameFinished = false;
          break;
        }
      }
      
      if (gameFinished) { //Finished!
        playSound('victory');
        setIsStopwatchStart(false);
        setCurrentScore(stopwatchTime.current);
        let tempHighScore = (highScore == Number.MAX_SAFE_INTEGER) ? highScore : toMilliseconds(highScore)
         if (toMilliseconds(stopwatchTime.current) <= tempHighScore) {
          storeHighScore(stopwatchTime.current)
          newHighScore(stopwatchTime.current);
        } 
        setScreen(3);
      }

    }
  }

  const [fontsLoaded] = useFonts({ // Importing Custom Fonts
    'madetommy': require('./assets/madetommy.otf'),
  });

  const [fontsLoaded2] = useFonts({
    'title': require('./assets/MotionPersonalUse.ttf')
  })

  const onLayoutRootView = React.useCallback(async () => { //Function that calls on Custom Font
    if (fontsLoaded && fontsLoaded2) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsLoaded2]);

  if (!fontsLoaded && !fontsLoaded2) {
    return null;
  }

  function Item ({ id }) { // Individual List Component

    const [animatedValue] = useState(new Animated.Value(0));
    
    const frontOpacity = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0]
    });
    const backOpacity = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1]
    });
    
    const frontInterpolate = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg']
    });
    const backInterpolate = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['180deg', '360deg']
    });

    const flipToBackStyle = {
      transform: [
      { rotateY: backInterpolate}
      ]
    };
    const flipToFrontStyle = {
      transform: [
        { rotateY: frontInterpolate }
      ]
    }

    const flipCard = () => {
      let flipCount = 0;
      for (var i = 0; i < memoryArray.length; i++) {
        if (memoryArray[i].covered == 0 && memoryArray[i].collected == 0) {
          flipCount++;
        }    
      }  
        if (memoryArray[id].covered == 1 && flipCount < 2) {
          Animated.timing( animatedValue, {
            toValue: 1,
            duration: 50,
            useNativeDriver: true,
          }).start(() => {
            let tempArray = [...memoryArray];
            tempArray[id].covered = 0;
            if (flipCount == 1) {
              checkAns(tempArray);
            }       
          });
        }
    }

    return (
      <TouchableOpacity onPress={flipCard} disabled={memoryArray[id].disabled}>
        <Animated.View style={[styles.item, {backfaceVisibility: "hidden", backgroundColor: (memoryArray[id].collected == 0) ?'#323854' : '#0c0a2b', borderRadius: 10, opacity: frontOpacity}, flipToFrontStyle]} />
        <Animated.Image style={[styles.item, {backfaceVisibility: "hidden", borderRadius: 10, position: 'absolute', top: 0, left: 0, opacity: backOpacity}, flipToBackStyle]} resizeMode={'cover'} source={memoryArray[id].image}/>
      </TouchableOpacity>
    );
  }

  const renderItem = ({ item }) => ( // Rendering Item for Flat List
    <Item name={item.name} id={item.id}  preview={item.image}/>
  );

  if (screen == 0) {
    return (
      <View style={[styles.container, {justifyContent: 'space-around'}]} onLayout={onLayoutRootView}>
        <View>
          <Text style={styles.title}> Match </Text>
        </View>
        <View style={{justifyContent: 'center'}}>
          <TouchableOpacity onPress={() => {
            let tempArray = [
              {
                name: 'Pink Floyd',
                id: 0,
                matchID: 0,
                covered: 1,
                collected: 0,
                disabled: false,
                image: require('./assets/pinkfloyd.jpg')
              },
              {
                name: 'Pink Floyd',
                id: 1,
                matchID: 0,
                covered: 1,
                collected: 0,
                disabled: false,
                image: require('./assets/darkside.png')
              },
              {
                name: 'Marvin Gaye',
                id: 2,
                matchID: 1,
                covered: 1,
                collected: 0,
                disabled: false,
                image: require('./assets/marvingaye.jpg')
              },
              {
                name: 'Marvin Gaye',
                id: 3,
                matchID: 1,
                covered: 1,
                collected: 0,
                disabled: false,
                image: require('./assets/whatsgoingon.webp')
              },
              {
                name: 'Michael Jackson',
                id: 4,
                matchID: 2,
                covered: 1,
                collected: 0,
                disabled: false,
                image: require('./assets/thriller.webp')
              },
              {
                name: 'Michael Jackson',
                id: 5,
                matchID: 2,
                covered: 1,
                collected: 0,
                disabled: false,
                image: require('./assets/michaeljackson.jpg')
              },
              {
                name: 'Ms. Lauryn Hill',
                id: 6,
                matchID: 3,
                covered: 1,
                collected: 0,
                disabled: false,
                image: require('./assets/laurynhill.jpeg')
              },
              {
                name: 'Ms. Lauryn Hill',
                id: 7,
                matchID: 3,
                covered: 1,
                collected: 0,
                disabled: false,
                image: require('./assets/miseducation.jpg')
              },
              {
                name: 'Whitney Houston',
                id: 8,
                matchID: 4,
                covered: 1,
                collected: 0,
                disabled: false,
                image: require('./assets/whitney.png')
              },
              {
                name: 'Whitney Houston',
                id: 9,
                matchID: 4,
                covered: 1,
                collected: 0,
                disabled: false,
                image: require('./assets/1985.jpg')
              },
              {
                name: 'Lil Uzi Vert',
                id: 10,
                matchID: 5,
                covered: 1,
                collected: 0,
                disabled: false,
                image: require('./assets/uzi.webp')
              },
              {
                name: 'Lil Uzi Vert',
                id: 11,
                matchID: 5,
                covered: 1,
                collected: 0,
                disabled: false,
                image: require('./assets/luvisrage2.webp')
              },
            ];
            
            shuffleArray(tempArray);
            for (let i = 0; i < tempArray.length; i++) {
              tempArray[i].id = i;
            }  
        
            setHighScore();
            setMemoryArray(tempArray);
            setScreen(2);
            readysetgo();
            setCount('3');
            setIsStopwatchStart(true);
          }}>
            <View style={{borderRadius: 10, backgroundColor: '#dcbf54', marginBottoms: '10%'}}>
              <Text style={[styles.paragraph, {textAlign: 'center', paddingHorizontal: 30, paddingVertical: 20, color: '#0c0a2b', fontSize: 20}]} numberOfLines={1}>
              Play
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => AsyncStorage.clear()}>
            <Text style={[styles.paragraph, {fontSize: 15}]}> Reset High Score </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (screen == 1) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: '5%', width: '100%'}}>
          <View style={{backgroundColor: '#dcbf54', borderRadius: 10, padding: 10, marginBottom: '10%', color: '#0c0a2b', alignItems: 'center'}}>
            <Stopwatch
              laps
              msecs
              start={isStopwatchStart}
              reset={resetStopwatch}
              options={styles.stopwatch}
              getTime={(time) => {
                stopwatchTime.current = time;
              }}
            />
          </View>
        </View>
        <FlatList
          data={memoryArray}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around'}}   
        />
        <TouchableOpacity onPress={() => {
          let tempArray = [...memoryArray];
          for (var i = 0; i < tempArray.length; i++) {
              tempArray[i].covered = 1;
          }
          setMemoryArray(tempArray);
        }}>
          <Text style={styles.paragraph}>
          Flip
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (screen == 2) {
    return(
      <SafeAreaView style={styles.container}>
        <Animated.Text style={[styles.paragraph, {color: textcolor, fontSize: 200}]}>
        {count}
        </Animated.Text>
      </SafeAreaView>
    );
  }

  if (screen == 3) {
    return(
      <SafeAreaView style={styles.container}>
        <View style={{alignItems: 'center', justifyContent: 'space-around', felxDirection: 'column', height: '60%'}}>
          <Text style={styles.header}>
            Best Time
          </Text>
          <Text style={styles.header}>
            {highScore}
          </Text>
          <Text style={styles.header}>
            Your Time
          </Text>
          <Text style={styles.header}>
            {currentScore}
          </Text>
          <TouchableOpacity onPress={() => {
            setScreen(0);
          }}>
            <View style={{borderRadius: 10, backgroundColor: '#dcbf54', marginBottoms: '10%'}}>
              <Text style={[styles.paragraph, {textAlign: 'center', paddingHorizontal: 30, paddingVertical: 20, color: '#0c0a2b', fontSize: 20}]} numberOfLines={1}>
              Main Menu
              </Text>
            </View>
          </TouchableOpacity> 
        </View>
      </SafeAreaView>      
    );
  }
}

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#0c0a2b',
    alignItems: 'center',
    paddingVertical: '10%'
  },
  item: {
    width: windowWidth * 0.3,
    height: windowWidth * 0.3,
    justifyContent: 'center',
    marginVertical: '5%',
  },
  paragraph: {
    fontFamily: 'madetommy',
    fontSize: 24,
    color: 'white'
  },
  title: {
    fontFamily: 'title',
    fontSize: 120,
    color: 'white'
  },
  header: {
    fontFamily: 'madetommy',
    fontSize: 40,
    color: 'white'
  },
  stopwatch: {
    textAlign: 'center',
    backgroundColor: '#dcbf54',
    paddingHorizontal: 20,
    marginBottom: '10%',
    color: '#0c0a2b',
    fontSize: 32,
    fontFamily: 'madetommy',
    paddingVertical: 10
  }
  
});
