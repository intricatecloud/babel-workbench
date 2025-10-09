import template from './html-file'

const bindings = {
  title: '<',
  onButtonClicked: '&',
};

class BiggerComponent {
  constructor($state, $transitions, angularService) {
    this.$state = $state;
    this.$transitions = $transitions;
    this.angularService = angularService;
  }

  doStuff() {
    console.log('hello')

    this.angularService.getData().then(data => {
      this.onButtonClicked();
    })
  }

  $onInit() {
    this.doStuff()
  }
}

export default {
  bindings,
  template,
  controller: ModalComponent,
};
