import React from "react";
import EpicsPV from "./EpicsPV";
import LocalPV from "./LocalPV";
import AutomationStudioContext from "./AutomationStudioContext";

/**
 * Dispatcher to instantiate a local PV or an EPICS PV.
 */
class DataConnection extends React.Component {
  render() {
    let extraConn = [];
    let pvname = this.props.pv;
    for (let elem in this.props.usePvInfo) {
      if (this.props.usePvInfo[elem].use) {
        extraConn.push(
          <EpicsPV
            key={pvname + this.props.usePvInfo[elem].field}
            pv={pvname + this.props.usePvInfo[elem].field}
            handleInputValue={(pvName, inputValue) =>
              this.props.onHandleInputField(pvName, inputValue, elem)
            }
          />
        );
      }
    }
    let localValue;
    if (this.context.localVariables.pv !== undefined) {
      localValue = this.context.localVariables.pv.value;
    }
    return (
      <React.Fragment>
        {pvname.includes("loc://") && (
          <LocalPV
            pv={pvname}
            value={localValue}
            localVariable={this.context.localVariables.pv}
            initialValue={this.props.initialLocalVariableValue}
            handleInputValue={this.props.handleInputValue}
            handleMetadata={this.props.handleMetadata}
            outputValue={this.props.outputValue}
            useStringValue={this.props.useStringValue}
            debug={this.props.debug}
          />
        )}
        {pvname.includes("pva://") && (
          <div>
            <EpicsPV
              key={pvname}
              pv={pvname}
              handleInputValue={this.props.handleInputValue}
              handleMetadata={this.props.handleMetadata}
              outputValue={this.props.outputValue}
              newValueTrigger={this.props.newValueTrigger}
              useStringValue={this.props.useStringValue}
              debug={this.props.debug}
            />
            {extraConn}
          </div>
        )}
      </React.Fragment>
    );
  }
}

DataConnection.contextType = AutomationStudioContext;

export default DataConnection;
