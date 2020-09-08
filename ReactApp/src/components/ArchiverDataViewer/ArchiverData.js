import React, { useContext, useState, useEffect } from 'react';
import AutomationStudioContext from '../SystemComponents/AutomationStudioContext';
import ContextMenu from "../SystemComponents/ContextMenu";
import TextField from '@material-ui/core/TextField';
import DateFnsUtils from '@date-io/date-fns';
import formatISO from 'date-fns/formatISO';
import {format,subHours,subSeconds,subMinutes,subDays,subWeeks,subMonths} from 'date-fns';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { useTheme } from '@material-ui/core/styles';
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import {
    XYPlot,
    XAxis,
    YAxis,
    HorizontalGridLines,
    VerticalGridLines,
    LineSeries,
    makeVisFlexible,
    Crosshair,
    DiscreteColorLegend
} from 'react-vis';
import GraphY from '../BaseComponents/GraphY';
import DateFnsAdapter from "@date-io/date-fns";
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import ZoomOutIcon from '@material-ui/icons/ZoomOut';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import {CrosshairsGps} from "mdi-material-ui/";
import { ArrowLeftRight } from "mdi-material-ui/";
import { ArrowUpDown } from "mdi-material-ui/";
import { Magnify } from "mdi-material-ui/";
const dateFns = new DateFnsAdapter();

const FlexibleXYPlot = makeVisFlexible(XYPlot);

const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200,
    },
    buttonRoot: {
        textTransform: 'none'
    }
}));
const calcTimeFormat = (timestamp) => {
    let mydate = new Date(timestamp * 1000);
    // let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // let year = mydate.getFullYear();
    // let month = months[mydate.getMonth()];
    // let date = mydate.getDate();
    // let hour = mydate.getHours();
    // let min = mydate.getMinutes();
    // let sec = mydate.getSeconds();
    // let ms = mydate.getMilliseconds()
    // //let value= hour + ':' + min + ':' + sec +':' + ms;
    // let value;
    // if (hour < 10) {
    //     hour = '0' + hour;

    // }
    // if (min < 10) {
    //     min = '0' + min;

    // }

    // if (sec < 10) {
    //     sec = '0' + sec;

    // }
    // value = hour + ':' + min + ':' + sec + " " + date + " " + month + " " + year;
    let value=format(mydate,'dd/MM/yyyy HH:mm:ss') 
    return value;
}

const useArchiverDataHook = (props) => {

    const context = useContext(AutomationStudioContext);
    const [dbWatchId, setDbWatchId] = useState(null);
    const [data, setData] = useState(null);
    // useEffect(()=>{
    //     setData([{data:[{secs:123123,val:1}]}])

    // },[])
    const [writeAccess, setWriteAccess] = useState(false);
    const [initialized, setInitialized] = useState(false);
   
    useEffect(() => {
        const handleArchiverReadAck = (msg) => {

            if (typeof msg !== 'undefined') {
                setDbWatchId(msg.dbWatchId)
            }
        }
        const handleArchiverReadData = (msg) => {
            // console.log(msg.data)
            //const newData = JSON.parse(msg.data);
            setData(msg.data);
            setInitialized(true)
            setWriteAccess(msg.write_access)
        }


        let socket = context.socket;
        let jwt = JSON.parse(localStorage.getItem('jwt'));
        if (jwt === null) {
            jwt = 'unauthenticated'
        }
        if (props.archiverURL) {
            socket.emit('archiverRead', { 'archiverURL': props.archiverURL, 'clientAuthorisation': jwt }, handleArchiverReadAck)
            socket.on('archiverReadData:' + props.archiverURL, handleArchiverReadData);
        }

        const reconnect = () => {
            if (props.archiverURL) {
                socket.emit('archiverRead', { 'archiverURL': props.archiverURL, 'clientAuthorisation': jwt }, handleArchiverReadAck)
            }
        }
        const disconnect = () => {
            if (props.archiverURL) {
                setInitialized(false);
                setData(null)
            }
        }
        socket.on('disconnect', disconnect);
        socket.on('reconnect', reconnect);
        return () => {

            if (props.archiverURL) {
                // if (dbWatchId !== null) {
                //     socket.emit('remove_dbWatch', { archiverURL: props.archiverURL, dbWatchId: dbWatchId, 'clientAuthorisation': jwt });
                // }
                // socket.removeListener('databaseWatchData:' + props.archiverURL, handleArchiverReadData);
                socket.removeListener('reconnect', reconnect);
                socket.removeListener('disconnect', disconnect);
            }

        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.archiverURL])
    console.log("useArchiverDataHook", data)
    return ({ data: data })

}

const ArchiverData = (props) => {

    const classes = useStyles();
    const theme = useTheme();
    const [showCrosshair, setShowCrosshair] =useState(props.showCrosshair===true?true:false)
    const [selectedFromDate, setSelectedFromDate] = useState(props.from?new Date(props.from):subHours(new Date(),1))
    const [selectedToDate, setSelectedToDate] = useState(props.to?new Date(props.to):new Date())
    
    
    const archData = useArchiverDataHook({ archiverURL: 'arch://DEMO_ARCHIVER:request:{"pv":"' + props.pv + '","options":{"from":"' + formatISO(selectedFromDate) + '","to":"' + formatISO(selectedToDate) + '"}}' })
    //const [xYData,setXYData]=useState([]);

    const handleOnClick30s=()=>
    { 
        let date= new Date();
        setSelectedFromDate(subSeconds(date,30))
        setSelectedToDate(date)
    }

    const handleOnClick1m=()=>
    { 
        let date= new Date();
        setSelectedFromDate(subMinutes(date,1))
        setSelectedToDate(date)
    }
    const handleOnClick5m=()=>
    { 
        let date= new Date();
        setSelectedFromDate(subMinutes(date,5))
        setSelectedToDate(date)
    }
    const handleOnClick30m=()=>
    { 
        let date= new Date();
        setSelectedFromDate(subMinutes(date,30))
        setSelectedToDate(date)
    }
    const handleOnClick1h=()=>
    { 
        let date= new Date();
        setSelectedFromDate(subHours(date,1))
        setSelectedToDate(date)
    }
    const handleOnClick2h=()=>
    { 
        let date= new Date();
        setSelectedFromDate(subHours(date,2))
        setSelectedToDate(date)
    }
    const handleOnClick12h=()=>
    { 
        let date= new Date();
        setSelectedFromDate(subHours(date,12))
        setSelectedToDate(date)
    }
    const handleOnClick1d=()=>
    { 
        let date= new Date();
        setSelectedFromDate(subDays(date,1))
        setSelectedToDate(date)
    }
    const handleOnClick2d=()=>
    { 
        let date= new Date();
        setSelectedFromDate(subDays(date,2))
        setSelectedToDate(date)
    }
    const handleOnClick1w=()=>
    { 
        let date= new Date();
        setSelectedFromDate(subWeeks(date,1))
        setSelectedToDate(date)
    }
    const data = archData.data;
    const [lineData, setLineData] = useState([]);
    const [crosshairValues, setCrosshairValues] = useState([]);
    const onNearestX = (value, { index }) => {
        console.log(index)
        console.log(lineData[index])

        setCrosshairValues([lineData[index]]);
    };

    // const data = useArchiverData({ archiverURL: "arch://DEMO_ARCHIVER:{pv:testIOC:BO1}" })
    console.log(archData)
    console.log(data)
    useEffect(() => {
        if (data !== null) {
            let newArchiverData = [];
            let newXYData = [];
            if (typeof data[0].data !== undefined) {
                console.log(data[0].data)
                newArchiverData = data[0].data

                let sample;
                for (sample in newArchiverData) {
                    console.log(sample, newArchiverData[sample].secs, calcTimeFormat(newArchiverData[sample].secs, newArchiverData[sample].val))
                    if (sample > 0) {
                        newXYData.push({ x: newArchiverData[sample].secs, y: newArchiverData[sample - 1].val })
                    }
                    newXYData.push({ x: newArchiverData[sample].secs, y: newArchiverData[sample].val })
                }


                //        // console.log(archiverData,xYData)
                console.log(newXYData)
                setLineData(newXYData);
            }

        }

    }, [data])
    useEffect(() => {

    }, [])

    const [anchorEl, setAnchorEl] = useState(null);
    const [openContextMenu, setOpenContextMenu] = useState(false);
  const handleToggleContextMenu = (event) => {
    
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.target);
    setOpenContextMenu(!openContextMenu);


  }
  const handleContextMenuClose = () => {
    setOpenContextMenu(false);
  }

    console.log(lineData)
   // console.log(crosshairValues)

    return (
        <React.Fragment>
            
                {props.debug && <Typography style={{ width: '100%' }}>
                    {"PV name: " + props.pv + " Data: "}
                </Typography>}
               
                <Button classes={{root: classes.buttonRoot}} onClick={handleOnClick30s}>
                        30s
                    </Button>
                    <Button classes={{root: classes.buttonRoot}} onClick={handleOnClick1m}>
                        1m
                    </Button>
                    <Button classes={{root: classes.buttonRoot}} onClick={handleOnClick5m}>
                        5m
                    </Button>
                    <Button classes={{root: classes.buttonRoot}} onClick={handleOnClick30m}>
                        30m
                    </Button>
                    <Button classes={{root: classes.buttonRoot}} onClick={handleOnClick1h}>
                        1h
                    </Button>
                    <Button classes={{root: classes.buttonRoot}} onClick={handleOnClick2h}>
                        2h
                    </Button>
                    <Button classes={{root: classes.buttonRoot}} onClick={handleOnClick12h}>
                        12h
                    </Button>
                    <Button classes={{root: classes.buttonRoot}} onClick={handleOnClick1d}>
                        1d
                    </Button>
                    <Button classes={{root: classes.buttonRoot}} onClick={handleOnClick2d}>
                        2d
                    </Button>
                    <Button classes={{root: classes.buttonRoot}} onClick={handleOnClick1w}>
                        1w
                    </Button>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <DateTimePicker
                        variant="inline"
                        ampm={false}
                        label="From:"
                        value={selectedFromDate}
                        onChange={setSelectedFromDate}
                        //onError={console.log}
                        //disablePast
                        format="yyyy/MM/dd HH:mm:ss"
                    />
                    <DateTimePicker
                        variant="inline"
                        ampm={false}
                        label="To:"
                        value={selectedToDate}
                        onChange={setSelectedToDate}
                        //onError={console.log}
                        //disablePast
                        format="yyyy/MM/dd HH:mm:ss"
                    />
                    </MuiPickersUtilsProvider>
                    <IconButton>
                        <ZoomInIcon />
                    </IconButton>
                    <IconButton>
                        <ZoomOutIcon />
                    </IconButton>

                    <IconButton>
                        <ArrowUpDown fontSize={'small'} />
                        <Magnify fontSize={'small'} />
                    </IconButton>
                    <IconButton>
                        <ArrowLeftRight fontSize={'small'} />
                        <Magnify fontSize={'small'} />
                    </IconButton>
                    <IconButton>
                        <ZoomOutMapIcon />
                    </IconButton>
                    <IconButton onClick={()=>setShowCrosshair(prev=>!prev)}>
                        <CrosshairsGps />
                    </IconButton>
              
                {<div style={{ width: '100%', height: '35vh' }}
                // onContextMenu={handleToggleContextMenu}
                onContextMenu={ props.disableContextMenu ? undefined : handleToggleContextMenu}
                >
                    <FlexibleXYPlot
                        
                        //yDomain={[0, 100]}
                        margin={{ left: 60 }} >
                        {/* <ContextMenu
                        disableProbe={props.disableProbe}
                        open={state.openContextMenu}
                        anchorReference="anchorPosition"
                        anchorPosition={{ top: +state.y0, left: +state.x0 }}
                        probeType={'readOnly'}
                        pvs={state.contextPVs}
                        handleClose={handleContextMenuClose}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                    /> */}
                        <HorizontalGridLines
                        //style={{stroke: theme.palette.type==='dark'?'#0097a7':'#B7E9ED'}} 
                        />
                        <VerticalGridLines
                        //style={{stroke: theme.palette.type==='dark'?'#0097a7':'#B7E9ED'}} 
                        />
                        <XAxis
                            title={(typeof props.xAxisTitle !== 'undefined') ? props.xAxisTitle : "X Axis"}
                            color="white"
                            tickFormat={v => calcTimeFormat(v)}
                            tickTotal={5}
                        // style={{
                        //   title:{stroke:theme.palette.type==='dark'?'#dbdbe0':'#6b6b76',strokeWidth:0.2},
                        //   line: {stroke: '#ADDDE1'},
                        //   ticks: {stroke: '#ADDDE1'},
                        //   text: {stroke: 'none', fill: theme.palette.type==='dark'?'#a9a9b2':'#6b6b76', fontWeight: 600}
                        // }}
                        />

                        <YAxis
                            title={(typeof props.yAxisTitle !== 'undefined') ? props.yAxisTitle : "Y Axis"}
                            left={9}
                        // tickFormat={props.yScaleLog10 === true ? v => "10E" + (v) + " " + props.yUnits : v => (v) + " " + props.yUnits} tickSize={20} tickPadding={2}
                        // style={{
                        //   title:{stroke:theme.palette.type==='dark'?'#ccccce':'#dbdbe0',strokeWidth:0.2},
                        //   text: {stroke: 'none', fill: theme.palette.type==='dark'?'#a9a9b2':'#6b6b76', fontWeight: 600}
                        // }}
                        />
                        <LineSeries

                            //key={pv.toString()}
                            // color={'grey'}
                            data={lineData}
                            onNearestX={onNearestX}
                            color={theme.palette.reactVis.lineColors[0]}
                            //http://localhost:3000/ArchiverDataViewerDemo   data={xYData}
                            //data={typeof this.state.pvs[this.state.pvs[pv].pvname].linedata==='undefined'?data:this.state.pvs[this.state.pvs[pv].pvname].linedata}
                            style={{
                                strokeLinejoin: 'round',
                                strokeWidth: 2

                            }}
                        />

                        {/* {multipleLineData()} */}

                        {/* 
                    {(typeof props.legend !== 'undefined') && <DiscreteColorLegend

                        style={{
                            position: 'absolute', right: '50px', top: '10px',
                            //  color:theme.palette.type==='dark'?'#ccccce':'#dbdbe0',strokeWidth:0.2
                        }
                        }
                        orientation="horizontal" items={legendItems} />} */}
                        {showCrosshair&&crosshairValues[0]&& <Crosshair
                            values={crosshairValues}

                        >   <div style={{ background: theme.palette.background.paper, padding: 8, whiteSpace: 'nowrap' }} >
                                <div >x: {calcTimeFormat(crosshairValues[0].x)}</div>
                                <div>Series 1: {crosshairValues[0].y}</div>

                            </div>

                        </Crosshair>}
                   
                    </FlexibleXYPlot>
                    <ContextMenu
  disableProbe={props.disableProbe}
  open={openContextMenu}
  pvs={[props.pv]}
  handleClose={handleContextMenuClose}
  anchorEl={anchorEl}
  anchorOrigin={{
    vertical: "bottom",
    horizontal: "center",
  }}
  transformOrigin={{
    vertical: "top",
    horizontal: "center",
  }}
  probeType={props.readOnly ? "readOnly" : undefined}
/>
                </div>}
           
        </React.Fragment>
    )
}
export default ArchiverData