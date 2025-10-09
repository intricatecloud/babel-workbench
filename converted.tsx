import template from './html-file';
const propTypes = {
  title: PropTypes.any,
  onButtonClicked: PropTypes.func,
  $state: PropTypes.any,
  $transitions: PropTypes.any,
  angularService: PropTypes.any
};
type Props = PropTypes.InferProps<typeof propTypes>;

class BiggerComponent extends React.Component<Props, {}> {
  static propTypes = propTypes;

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
    this.doStuff();
  }

}

export default BiggerComponent;
