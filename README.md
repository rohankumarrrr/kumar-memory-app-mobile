# Expo Snack app

Open the `App.js` file to view the source code. This is an expo snack app. The link to the snack is attached.

My memory game app's theme is matching popular Pop and R&B Artist's faces with their most iconic album covers. It features Pink Floyd's Dark Side of the Moon, Whitney Houston's self-titled album, The Miseducation of Lauryn Hill, Lil Uzi Vert's LUV Is Rage 2, Marvin Gaye's What's Going On, and Michael Jackson's Thriller. I am using a FlatList to render a custom component titled "Item", which represents each memory card. I am also importing and utilizing animated in multiple instances. When the user first presses "Play", a countdown will animate before the game starts so the user can prepare to beat their high score. Additionally I have an animated value that interpolates when the user clicks on a flipped over card that shows a cool animation where the card flips over. When the user flips over two cards, they will disappear if the cards are a match. If they are not a match, the user must press the flip button to flip the cards back over. While the round is going, a Stopwatch timer from react-native-stopwatch-timer is running to keep track of their time. After the user flips over all the cards, they are sent to a seperate screen that displays their current time for that match and their best time. A trumpet sound also plays. The best time is saved to local storage via Async Storage. Overall, the app is simple but effective in being a fun memory game for fans of music. */

/* LIMITATION #1: The user is sometimes able to break the app when they flip three cards at once. This is because the flipCount does not update until the flipping card animation is completed. The only way the user can play this app is when waiting for one card to flip completely over before flipping another. To (somewhat) remedy this, I have shortened the animation time from 400ms to 50ms so hopefully the user is not able to flip over three cards within this time period. Unfortunately, doing this also means that the cards "disappear" when matched faster than I would like them too (Ideally, they would linger on the screen for a little while longer before disappearing).

  LIMITATION #2: Occasionally and very rarely, the async storage high score save will cease to work altogther. When this happens, the user is unable to see the final screen of the game upon finishing matching all the cards. I do not know why this happens, but for this reason, I have implemented a "Reset High Score" button on the main menu which clears AsyncStorage to solve this issue.

  LIMITATION #3: Rarely, certain Images don't load. 
 

When you're ready to see everything that Expo provides (or if you want to use your own editor) you can **Download** your project and use it with [expo-cli](https://docs.expo.io/get-started/installation).

All projects created in Snack are publicly available, so you can easily share the link to this project via link, or embed it on a web page with the `<>` button.

If you're having problems, you can tweet to us [@expo](https://twitter.com/expo) or ask in our [forums](https://forums.expo.io/c/snack).

Snack is Open Source. You can find the code on the [GitHub repo](https://github.com/expo/snack).
