import React from "react";
import { Link } from "react-router-dom";
import {
  ClickAwayListener,
  Divider,
  ListItemIcon,
  MenuItem,
  MenuList,
  Paper,
  Popover,
  Typography,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { Lock, ViewList } from "@material-ui/icons";
import {
  Coffee,
  LanConnect,
  LanDisconnect,
  ContentCopy,
} from "mdi-material-ui/";
import PropTypes from "prop-types";
import AutomationStudioContext from "./AutomationStudioContext";

const styles = (theme) => ({
  body1: theme.typography.body1,
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  ConnecedIcon: {
    backgroundColorcolor: theme.palette.primary.main,
  },
});

class ContextMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menuSelectedIndex: 0,
    };
    this.copyAllPvNamesClipboard = this.copyAllPvNamesClipboard.bind(this);
    this.copyPvNameClipboard = this.copyPvNameClipboard.bind(this);
    this.copyPvValueClipboard = this.copyPvValueClipboard.bind(this);
    this.handleMenuItemSelect = this.handleMenuItemSelect.bind(this);
  }

  copyAllPvNamesClipboard() {
    let pvnames = "";
    for (let pv in this.props.pvs) {
      pvnames += this.props.pvs[pv].pvname.toString() + "\n";
    }
    navigator.clipboard.writeText(pvnames);
    this.props.handleClose();
  }

  copyPvNameClipboard() {
    if (navigator.clipboard !== undefined) {
      navigator.clipboard.writeText(
        this.props.pvs[this.state.menuSelectedIndex].pvname
      );
    }
    this.props.handleClose();
  }

  copyPvValueClipboard() {
    if (navigator.clipboard !== undefined) {
      navigator.clipboard.writeText(
        this.props.pvs[this.state.menuSelectedIndex].value
      );
    }
    this.props.handleClose();
  }

  handleMenuItemSelect(index) {
    this.setState({ menuSelectedIndex: index });
  }

  getListItems(pvs) {
    let listItems = [];
    for (let i = 0; i < pvs.length; i++) {
      let icon = (
        <LanDisconnect style={{ color: this.props.theme.palette.error.main }} />
      );
      if (pvs[i].initialized) {
        if (pvs[i].metadata && !pvs[i].metadata.write_access) {
          icon = (
            <Lock style={{ color: this.props.theme.palette.error.main }} />
          );
        } else {
          icon = (
            <LanConnect
              style={{ color: this.props.theme.palette.primary.main }}
            />
          );
        }
      }
      listItems.push(
        <MenuItem
          key={pvs[i].pvname.toString() + i}
          onClick={() => this.handleMenuItemSelect(i)}
          selected={i === this.state.menuSelectedIndex}
        >
          <ListItemIcon>{icon}</ListItemIcon>
          <Typography variant="inherit">{pvs[i].pvname}</Typography>
        </MenuItem>
      );
    }
    return listItems;
  }

  render() {
    let probeElem;
    let multiplPvsHeaderElem;
    let copyAllNamesElem;
    let copySingleNameElem;
    let copySingleValElem;
    const pvs = this.props.pvs;
    const enableProbe =
      this.props.disableProbe !== undefined
        ? !this.props.disableProbe
        : this.context.enableProbe;
    let listPvsElem = this.getListItems(pvs);
    if (pvs.length > 1) {
      multiplPvsHeaderElem = (
        <div>
          <MenuItem>
            <ListItemIcon>
              <ViewList />
            </ListItemIcon>
            <Typography variant="inherit">{"Process Variables"}</Typography>
          </MenuItem>
          <Divider />
        </div>
      );
      if (navigator.clipboard !== undefined) {
        copyAllNamesElem = (
          <MenuItem onClick={this.copyAllPvNamesClipboard}>
            <ListItemIcon>
              <ContentCopy />
            </ListItemIcon>
            <Typography variant="inherit">
              Copy All PV Names to Clipboard
            </Typography>
          </MenuItem>
        );
      }
    }
    if (enableProbe) {
      probeElem = (
        <MenuItem
          onClick={this.props.handleClose}
          component={Link}
          to={{
            pathname: "/Probe",
            search: JSON.stringify({
              pvname: pvs[this.state.menuSelectedIndex].pvname,
              probeType: this.props.probeType,
            }),
            state: ["sdas"],
            data: "hello2",
          }}
          target="_blank"
        >
          <ListItemIcon>
            <Coffee />
          </ListItemIcon>
          <Typography variant="inherit">
            {"Probe " + (pvs.length > 1 ? "selected " : "") + "PV"}
          </Typography>
        </MenuItem>
      );
    }
    if (navigator.clipboard !== undefined) {
      copySingleNameElem = (
        <MenuItem onClick={this.copyPvNameClipboard}>
          <ListItemIcon>
            <ContentCopy />
          </ListItemIcon>
          <Typography variant="inherit">
            {"Copy " +
              (pvs.length > 1 ? "selected " : "") +
              "PV Name to Clipboard"}
          </Typography>
        </MenuItem>
      );
      copySingleValElem = (
        <MenuItem onClick={this.copyPvValueClipboard}>
          <ListItemIcon>
            <ContentCopy />
          </ListItemIcon>
          <Typography variant="inherit">
            {"Copy " +
              (pvs.length > 1 ? "selected " : "") +
              "PV Value to Clipboard"}
          </Typography>
        </MenuItem>
      );
    }
    return (
      <Popover
        open={this.props.open}
        anchorEl={this.props.anchorEl}
        anchorOrigin={this.props.anchorOrigin}
        transformOrigin={this.props.transformOrigin}
        anchorReference={this.props.anchorReference}
        anchorPosition={this.props.anchorPosition}
      >
        <Paper>
          <ClickAwayListener onClickAway={this.props.handleClose}>
            <MenuList>
              {multiplPvsHeaderElem}
              {listPvsElem}
              <Divider />
              {probeElem}
              <Divider />
              {copyAllNamesElem}
              {copySingleNameElem}
              {copySingleValElem}
            </MenuList>
          </ClickAwayListener>
        </Paper>
      </Popover>
    );
  }
}

ContextMenu.propTypes = { classes: PropTypes.object.isRequired };

ContextMenu.contextType = AutomationStudioContext;

export default withStyles(styles, { withTheme: true })(ContextMenu);
