import { GoogleSignin, statusCodes } from '@react-native-community/google-signin';
import { firebase } from '@react-native-firebase/auth';

import database from '@react-native-firebase/database';
import {createFile} from '../../components/UserDataHandling/UserDataHandling'
// Calling this function will open Google for login.
export async function googleLogin(navigate) {
  try {
    // add any configuration settings here:
    console.log("sign in...")
    await GoogleSignin.configure({
        //scopes: ['https://www.googleapis.com/auth/userinfo.profile'], // what API you want to access on behalf of the user, default is email and profile
        androidClientId: '481165231932-btaodd993ed6eqh194o4hgggn8pjrh9e.apps.googleusercontent.com',
        webClientId: '481165231932-ukaldksg16h5f2h78qfocgp0856er5aa.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
        //offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
        //hostedDomain: '', // specifies a hosted domain restriction
        //loginHint: '', // [iOS] The user's ID, or email address, to be prefilled in the authentication UI if possible. [See docs here](https://developers.google.com/identity/sign-in/ios/api/interface_g_i_d_sign_in.html#a0a68c7504c31ab0b728432565f6e33fd)
        //forceConsentPrompt: true, // [Android] if you want to show the authorization prompt at each login.
        //accountName: '', // [Android] specifies an account name on the device that should be used
    });
    console.log("has play services")
    await GoogleSignin.hasPlayServices();
    const { accessToken, idToken } = await GoogleSignin.signIn();

    // create a new firebase credential with the token
    const credential = firebase.auth.GoogleAuthProvider.credential(idToken, accessToken);
    // login with credential
    const firebaseUserCredential = await firebase.auth().signInWithCredential(credential);

    //console.warn(JSON.stringify(firebaseUserCredential.user.toJSON()));
    //console.log(firebaseUserCredential.user.toJSON())

    let photo =firebaseUserCredential.user.toJSON().photoURL
    let name = firebaseUserCredential.user.toJSON().displayName
    let email = firebaseUserCredential.user.toJSON().email
    let phone = firebaseUserCredential.user.toJSON().phoneNumber
    let uid = firebaseUserCredential.user.toJSON().uid
    let content = uid+"\n"+name+"\n"+email+"\n"+phone+"\n"+photo
    console.log(content)
    createFile('user.file',content)

    const ref = database().ref('/users/').child(uid);

    await ref.set({
      name: name,
      email: email,
      phone: phone,
      photo: photo
    });

    navigate('App')
    
  } catch (error) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
        console.log(error.code+": "+error.message+"user cancelled the login flow")
        } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
        console.log(error.code+": "+error.message+"operation (e.g. sign in) is in progress already")
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
        console.log(error.code+": "+error.message+"play services not available or outdated")
        } else {
        // some other error happened
        console.log(error.code+": "+error.message+"some other error happened")
        }
  }
}