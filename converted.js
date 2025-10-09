import template from './html-file';
const propTypes = {
  title: PropTypes.any,
  onButtonClicked: PropTypes.func
};
type Props = PropTypes.InferProps<typeof propTypes>;

class BiggerComponent extends React.Component<Props, {}> {
  constructor($state, $transitions, angularService) {
    this.$state = $state;
    this.$transitions = $transitions;
    this.angularService = angularService;
  }

  doStuff() {
    console.log('hello');
    this.angularService.getData().then(data => {
      this.props.onButtonClicked();
    });
  }

  componentDidMount() {
    doStuff();
  }

}

BiggerComponent.propTypes = propTypes;
export default {
  bindings,
  template,
  controller: ModalComponent
};
