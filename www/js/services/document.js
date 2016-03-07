(function (angular) {
    'use strict';

    angular
        .module('scout.services')
        .service('$csDocument', documentService);

    function documentService($q, $http, $auth, $rootScope) {

        var offlineEvents = {
                get: '$csDocument.getDocument',
                upload: '$csDocument.uploadDocument'
            },
            offlineFns = {
                get: getDocument,
                upload: uploadDocument
            },
            self = this;

        this.get = getDocument;
        this.upload = uploadDocument;

        // events that are fired when the device comes back online
        document.addEventListener('get', evalFnFromOfflineEvent);
        document.addEventListener('upload', evalFnFromOfflineEvent);

        function evalFnFromOfflineEvent(evt) {
            var evt = evt.detail.data.detail;
            offlineFns[evt.identifier].apply(self, evt.args);
        }

        function uploadDocument(folderId, filename, saveAsFilename) {
            var promise = $q.defer(),
                offlineManager = new Appworks.AWOfflineManager(),
                auth = new Appworks.Auth(uploadDocumentOnReauth);

            if (offlineManager.networkStatus().online) {
                auth.getAuthResponse();
            } else {
                offlineManager.defer('upload', arguments);
            }

            function uploadDocumentOnReauth(data) {
                var url = data.authData.gatewayUrl + $rootScope.contentServicePath + folderId + '/children',
                    config = {
                        headers: {
                            otcsticket: data.authData.authResponse.addtl['otsync-connector'].otcsticket
                        }
                    };

                // find the node id for file named => filename
                console.log('Attempting to fetch children of expedition root folder via contentService');
                $http.get(url, config).then(function (res) {
                    console.info('Got children of expedition root folder via contentService', res.data);
                    angular.forEach(res.data.contents, function (item) {
                        if (item.name === filename) {
                            uploadFile(item.id, saveAsFilename, broadcastCompletion, promise.reject, data.authData);
                        }
                    });
                });
            }

            function broadcastCompletion(model) {
                $rootScope.$broadcast('$csDocument.upload.complete', model);
            }

            return promise.promise;
        }

        function uploadFile(fileId, filename, success, fail, config) {
            var uploadUrl = config.gatewayUrl +
                    $rootScope.contentServicePath +
                    fileId +
                    '/content?versionNum=1&cstoken=' +
                    config.authResponse.addtl['otsync-connector'].otcsticket,
                options = new FileUploadOptions(),
                fileTransfer = new Appworks.AWFileTransfer(success, fail);

            options.headers = {'otcsticket': config.authResponse.addtl['otsync-connector'].otcsticket};
            console.log('Attempting to upload file via contentService...');
            fileTransfer.upload(filename, uploadUrl, options, true);
        }

        function downloadFile(fileId, filename, success, fail, config) {
            var downloadUrl = config.gatewayUrl +
                    $rootScope.contentServicePath +
                    fileId +
                    '/content?versionNum=1&cstoken=' +
                    config.authResponse.addtl['otsync-connector'].otcsticket,
                options = new FileUploadOptions(),
                storageManager = new Appworks.AWFileTransfer(success, fail);

            options.headers = {'otcsticket': config.authResponse.addtl['otsync-connector'].otcsticket};
            console.log('Attempting to download file via contentService...');
            storageManager.download(downloadUrl, filename, options, true);
        }

        function getDocument(folderId, filename, saveAsFilename) {
            var promise = $q.defer(),
                offlineManager = new Appworks.AWOfflineManager(),
                auth = new Appworks.Auth(getDocumentOnReauth);

            if (folderId && filename && saveAsFilename) {
                if (offlineManager.networkStatus().online) {
                    auth.getAuthResponse();
                } else {
                    offlineManager.defer('get', arguments);
                }
            } else {
                promise.reject('Did not provide one of: folderId, filename, saveAsFilename');
            }

            function getDocumentOnReauth(data) {
                var url = data.authData.gatewayUrl + $rootScope.contentServicePath + folderId + '/children',
                    config = {
                        headers: {
                            otcsticket: data.authData.authResponse.addtl['otsync-connector'].otcsticket
                        }
                    };

                // find the node id for file named => filename
                console.log('Attempting to fetch children of expedition root folder via contentService');
                $http.get(url, config).then(function (res) {
                    console.info('Got children of expedition root folder via contentService', res.data);
                    angular.forEach(res.data.contents, function (item) {
                        if (item.name === filename) {
                            downloadFile(item.id, saveAsFilename, promise.resolve, promise.reject, data.authData);
                        }
                    });
                });
            }

            return promise.promise;
        }
    }

})(window.angular);
