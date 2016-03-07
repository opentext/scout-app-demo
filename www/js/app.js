angular
    .module('scout', ['ionic', 'ngFileSaver', 'scout.controllers', 'scout.services']);

angular
    .module('scout')
    .run(onIonicReady);

angular
    .module('scout')
    .run(function ($rootScope) {
        $rootScope.version = '1.1.10';
        $rootScope.contentServicePath = '/content/v5/nodes/';
        $rootScope.scoutServicePath = '/scoutService/api/expeditions';
    });

// notification handler
angular
    .module('scout')
    .run(function ($timeout, $state) {
        $timeout(function () {
            var notificationManager = new Appworks.AWNotificationManager();
            notificationManager.enablePushNotifications(function (notification) {
                /*
                    notification should have the form:
                    {
                        action: 'go',
                        state: 'tab.expedition',
                        params: {id: id}
                    }
                 */
                if (notification.action && notification.state && notification.params) {
                    $state.go('tab.expedition', {id: notification.params.id});
                    //$state[notification.action](notification.state, notification.params);
                }
            });
        }, 2000);
    });

angular
    .module('scout')
    .config(function($compileProvider){
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file|blob|cdvfile|assets-library):|data:image\//);
    });

function onIonicReady($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleLightContent();
        }
    });
}
