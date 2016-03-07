angular
    .module('scout.controllers')
    .controller('NewExpeditionController', NewExpeditionController);

function NewExpeditionController($scope, $ionicModal, $state, $rootScope, Expedition) {

    // variable bindings
    $scope.newExpedition = {};
    $ionicModal.fromTemplateUrl('templates/expeditions/new-expedition.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });

    // function bindings
    $scope.openNewExpeditionModal = openNewExpeditionModal;
    $scope.closeNewExpeditionModal = closeNewExpeditionModal;
    $scope.startNewExpedition = startNewExpedition;

    function closeNewExpeditionModal() {
        $scope.modal.hide();
        $scope.newExpedition = {};
    }

    function openNewExpeditionModal() {
        $scope.modal.show();
    }

    function startNewExpedition(expedition) {
        if (validate(expedition)) {
            Expedition.create(expedition).then(function (newExpedition) {
                $scope.newExpedition = {};
                $rootScope.$broadcast('expeditions.reload');
                $state.go('tab.expedition', {id: newExpedition.id});
            });
        }
        $scope.modal.hide();
    }

    function validate(expedition) {
        var result = false;
        if (expedition && expedition.title) {
            result = true;
            // remove nonalphanumeric characters
            expedition.title = expedition.title.replace(/\W/g, '');
        }
        return result;
    }

}
