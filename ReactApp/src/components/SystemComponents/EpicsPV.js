import React from "react";
import uuid from "uuid";
import { withStyles } from "@material-ui/core/styles";
import RedirectToLogIn from "./RedirectToLogin.js";
import AutomationStudioContext from "./AutomationStudioContext";

const styles = (theme) => ({
  body1: theme.typography.body1,
});

class EpicsPV extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: uuid.v4(),
      initialized: false,
      pvname: this.props.pv,
      internalValue: " ",
      inputValue: this.props.value,
      severity: undefined,
      timestamp: undefined,
      pv: {
        intialized: false,
        pvname: "",
        value: "",
        char_value: "",
        alarmColor: "",
        lower_disp_limit: 0,
        upper_disp_limit: 10000,
        lower_warning_limit: 4000,
        upper_warning_limit: 6000,
        units: "V",
        precision: 0,
      },
      redirectToLogInPage: false,
    };
    this.handleRedirectToLogIn = this.handleRedirectToLogIn.bind(this);
    this.updatePVData = this.updatePVData.bind(this);
    this.connectError = this.connectError.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.reconnect = this.reconnect.bind(this);
    this.handleInitialConnection = this.handleInitialConnection.bind(this);
  }

  handleInputValue() {
    this.props.handleInputValue(
      this.state.pvname,
      this.state.internalValue,
      this.state.initialized,
      this.state.severity,
      this.state.timestamp
    );
  }

  handleMetadata() {
    if (this.props.handleMetadata !== undefined) {
      this.props.handleMetadata(this.state.pvname, this.state.pv);
    }
  }

  updatePVData(msg) {
    if (this.props.debug) {
      console.log("updateDate is active");
    }
    if (msg.connected === "0") {
      this.setState({ initialized: false });
    } else {
      if (msg.newmetadata === "False") {
        this.setState({
          internalValue: this.props.useStringValue ? msg.char_value : msg.value,
          severity: msg.severity,
          timestamp: msg.timestamp,
        });
      } else {
        this.setState({
          pv: {
            pvname: msg.pvname,
            value: msg.value,
            char_value: msg.char_value,
            alarmColor: "",
            enum_strs: msg.enum_strs,
            lower_disp_limit: msg.lower_disp_limit,
            upper_disp_limit: msg.upper_disp_limit,
            lower_warning_limit: msg.lower_warning_limit,
            upper_warning_limit: msg.upper_warning_limit,
            lower_ctrl_limit: msg.lower_ctrl_limit,
            upper_ctrl_limit: msg.upper_ctrl_limit,
            units: msg.units,
            precision: parseInt(msg.precision),
            severity: msg.severity,
            write_access: msg.write_access,
            read_access: msg.read_access,
            host: msg.host,
          },
          internalValue: this.props.useStringValue ? msg.char_value : msg.value,
          initialized: true,
          severity: msg.severity,
          timestamp: msg.timestamp,
        });
        this.handleMetadata();
      }
    }
    this.handleInputValue();
  }

  connectError() {
    if (this.props.debug) {
      console.log(this.state.pvname, "client: connect_error");
    }
    this.setState({ initialized: false });
    this.handleInputValue();
  }

  disconnect() {
    if (this.props.debug) {
      console.log(this.state.pvname, "client: disconnected");
    }
    this.setState({ initialized: false });
    this.handleInputValue();
  }

  reconnect() {
    if (this.props.debug) {
      console.log(this.state.pvname, "client: reconnect");
    }
    let socket = this.context.socket;
    let jwt = JSON.parse(localStorage.getItem("jwt"));
    if (jwt === null) {
      jwt = "unauthenticated";
    }
    socket.emit("request_pv_info", {
      data: this.state.pvname,
      clientAuthorisation: jwt,
    });
  }

  handleInitialConnection() {
    if (!this.state.initialized) {
      this.updatePVData({ connected: "0" });
    }
  }

  componentDidMount() {
    let socket = this.context.socket;
    let jwt = JSON.parse(localStorage.getItem("jwt"));
    if (jwt === null) {
      jwt = "unauthenticated";
    }
    socket.emit("request_pv_info", {
      data: this.state.pvname,
      clientAuthorisation: jwt,
    });
    this.timeout = setTimeout(this.handleInitialConnection, 3000);
    socket.on(this.state.pvname, this.updatePVData);
    socket.on("connect_error", this.connectError);
    socket.on("disconnect", this.disconnect);
    socket.on("reconnect", this.reconnect);
    socket.on("redirectToLogIn", this.handleRedirectToLogIn);
  }

  handleRedirectToLogIn() {
    if (!this.state.redirectToLogInPage) {
      this.setState({ redirectToLogInPage: true });
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
    this.timeout = null;
    let socket = this.context.socket;
    socket.removeListener(this.state.pvname, this.updatePVData);
    socket.removeListener("connect_error", this.connectError);
    socket.removeListener("disconnect", this.disconnect);
    socket.removeListener("reconnect", this.reconnect);
    socket.removeListener("redirectToLogIn", this.handleRedirectToLogIn);
  }

  componentDidUpdate(prevProps) {
    const value = this.state.internalValue;
    const pvname = this.state.pvname;
    const initialized = this.state.initialized;
    if (this.props.debug) {
      console.log(
        "componentDidUpdate this.props.outputValue:",
        this.props.outputValue
      );
      console.log(
        "componentDidUpdate prevProps.outputValue:",
        prevProps.outputValue
      );
      console.log("componentDidUpdate internal Epics value:", value);
      console.log(
        "this.props.newValueTrigger",
        this.props.newValueTrigger,
        "prevProps.newValueTrigger",
        prevProps.newValueTrigger
      );
    }
    if (
      initialized &&
      this.props.outputValue !== undefined &&
      ((this.props.outputValue !== prevProps.outputValue &&
        this.props.outputValue !== value) ||
        (this.props.newValueTrigger !== undefined &&
          this.props.newValueTrigger !== prevProps.newValueTrigger))
    ) {
      if (this.props.debug) {
        console.log(
          "this.props.newValueTrigger",
          this.props.newValueTrigger,
          "prevProps.newValueTrigger",
          prevProps.newValueTrigger
        );
      }
      let socket = this.context.socket;
      let jwt = JSON.parse(localStorage.getItem("jwt"));
      if (jwt === null) {
        jwt = "unauthenticated";
      }
      if (!this.state.redirectToLogInPage) {
        socket.emit("write_to_pv", {
          pvname: pvname,
          data: this.props.outputValue,
          clientAuthorisation: jwt,
        });
      }
    }
  }

  render() {
    const { classes } = this.props;
    const value = this.state.internalValue;
    const pvname = this.state.pvname;
    const initialized = this.state.initialized;
    const redirectToLogInPage = this.state.redirectToLogInPage;
    if (this.props.debug) {
      if (initialized) {
        let mydate = new Date(this.state.timestamp * 1000);
        let months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        let year = mydate.getFullYear();
        let month = months[mydate.getMonth()];
        let date = mydate.getDate();
        let hour = mydate.getHours();
        let min = mydate.getMinutes();
        let sec = mydate.getSeconds();
        let ms = mydate.getMilliseconds();
        let time =
          date +
          " " +
          month +
          " " +
          year +
          " " +
          hour +
          ":" +
          min +
          ":" +
          sec +
          ":" +
          ms;
        return (
          <div className={classes.body1}>
            <div>{"EPICS Debug Info:"}</div>
            <div>{"Python server variable: " + pvname}</div>
            <div>{"PV name: " + pvname.replace("pva://", "")}</div>
            <div>{"Current Value: " + value}</div>
            <div>{"Timestamp: " + time}</div>
            <div>
              {"New Value from parent component: " + this.props.outputValue}
            </div>
            {/*<RedirectToLogIn/>*/}
          </div>
        );
      } else {
        return (
          <div style={{ background: "#eee", padding: "20px", margin: "20px" }}>
            <div>{"EPICS Debug Info:"}</div>
            <div>{"Connecting to Python server variable: " + pvname}</div>
            {/*<RedirectToLogIn/>*/}
          </div>
        );
      }
    } else {
      return (
        <React.Fragment>
          {/*redirectToLogInPage&&<Redirect  push={true} to='/LogIn' />*/}
          {this.context.styleGuideRedirect && <RedirectToLogIn />}
        </React.Fragment>
      );
    }
  }
}

EpicsPV.contextType = AutomationStudioContext;

export default withStyles(styles)(EpicsPV);
