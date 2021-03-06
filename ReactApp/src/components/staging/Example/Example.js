import React, { Component } from 'react';

import withStyles from '@material-ui/core/styles/withStyles';
import { withRouter } from 'react-router-dom';

import { Link } from 'react-router-dom'
import Button from '@material-ui/core/Button';
import TraditionalLayout from '../../../components/UI/Layout/ComposedLayouts/TraditionalLayout.js';
import Grid from '@material-ui/core/Grid';
// Styles




const styles = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,



  },
  center: {
    margin: 'auto',

    width: '15%',
    height: '50%'

  },
  button: {
    marginTop: '10px',
    paddingTop: '10px'
  }

});








class Example extends Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
  }

  logout() {
    localStorage.removeItem('jwt');

  }

  render() {


    const { classes } = this.props;

    return (
      <TraditionalLayout
        title="Staging Area Examples"
        denseAppBar
        alignTitle="center"
      >
        <Grid container direction="row" item justify="center" spacing={1} alignItems="center" style={{ paddingTop: 64 }}>
          <Grid item lg={4} sm={4} xs={2}>
          </Grid>
          <Grid item lg={2} sm={4} xs={8}>
            <Grid container direction="row" justify="center" spacing={3} alignItems="stretch">
              <Grid item xs={12}  >
                <Button fullWidth className={classes.button} component={Link} to="/Example1" color="primary" variant='contained'>  Example1 </Button>

              </Grid>
              <Grid item xs={12}  >
                <Button fullWidth className={classes.button} component={Link} to="/Example2" color="primary" variant='contained'>  Example2 </Button>
              </Grid>
              <Grid item xs={12}  >
                <Button fullWidth className={classes.button} component={Link} to="/Example3" color="primary" variant='contained'>  Example3 </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item lg={4} sm={4} xs={2}>
          </Grid>
        </Grid>
      </TraditionalLayout>






    )
  }
}

export default withRouter(withStyles(styles)(Example));
