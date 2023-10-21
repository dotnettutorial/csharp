---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Firebase
---------------------------------------------------------
https://github.com/hackstarsj/FirebaseWebPushNotification
https://github.com/firebase/quickstart-js/blob/master/messaging/firebase-messaging-sw.js
------------------------------------------
-> create firebase-messaging-sw.js in root folder

importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

if ('serviceWorker' in navigator) {
navigator.serviceWorker.register('../firebase-messaging-sw.js')
  .then(function(registration) {
    console.log('Registration successful, scope is:', registration.scope);
  }).catch(function(err) {
    console.log('Service worker registration failed, error:', err);
  });
}

 const firebaseConfig = {
            apiKey: "AIzaSyDyQrkdGDhen6UMUxA019jHLZz3boMPMQ8",
            authDomain: "sheetaltest-f3f7f.firebaseapp.com",
            projectId: "sheetaltest-f3f7f",
            storageBucket: "sheetaltest-f3f7f.appspot.com",
            messagingSenderId: "1046579733168",
            appId: "1:1046579733168:web:4df5995e371c51dc9f9175",
            measurementId: "G-3E7T08GZ4P"
        };
        firebase.initializeApp(firebaseConfig);
        const firebasemessaging = firebase.messaging();
        
        firebasemessaging.onBackgroundMessage((payload) => {
            console.log('Message received. ', payload);
        });
---------------------------------
-> JS

<script src="https://cdnjs.cloudflare.com/ajax/libs/firebase/10.0.0/firebase-app-compat.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/firebase/10.0.0/firebase-messaging-compat.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script type="module">

	const firebaseConfig = {
		apiKey: "AIzaSyDyQrkdGDhen6UMUxA019jHLZz3boMPMQ8",
		authDomain: "sheetaltest-f3f7f.firebaseapp.com",
		projectId: "sheetaltest-f3f7f",
		storageBucket: "sheetaltest-f3f7f.appspot.com",
		messagingSenderId: "1046579733168",
		appId: "1:1046579733168:web:4df5995e371c51dc9f9175",
		measurementId: "G-3E7T08GZ4P"
	};
	firebase.initializeApp(firebaseConfig);
	const firebasemessaging = firebase.messaging();
	firebasemessaging.getToken({ vapidKey: 'BEKM6KtNh1cSWUBCyXbABZLKGa3rwkOLmd6YwvAYo4aIyPX6K8Vc_GD4ASjn5R78ka4C3f6WGXIYFy30aNAVGzY' }).then((currentToken) => {
		if (currentToken) {
			console.log(currentToken)
		} else {
			console.log('No registration token available. Request permission to generate one.');
		}
	}).catch((err) => {
		console.log('An error occurred while retrieving token. ', err);
	});
	firebasemessaging.onMessage((payload) => {
		console.log('Message received. ', payload);
	});

</script>

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
OnSignal
---------------------------------------------------------
->create OneSignalSDKWorker.js in root folder

importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

----------------------
->JS

<script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
<script>
	window.OneSignalDeferred = window.OneSignalDeferred || [];
	OneSignalDeferred.push(function (OneSignal) {
		OneSignal.init({
			appId: "f722625e-1dfc-4744-9dc2-52b6fe88fb9b",
		});
	});
	OneSignalDeferred.push(function (OneSignal) {
		if (OneSignal.User._currentUser.hasOneSignalId) {
			console.log(OneSignal.User._currentUser.onesignalId);
		}
	});
</script>


5717298.0186
