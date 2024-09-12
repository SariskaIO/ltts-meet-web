import { Box, Hidden, makeStyles, Typography } from '@material-ui/core'
import React from 'react'
import { Link } from 'react-router-dom'
import { color } from '../../../assets/styles/_color';
import { profile } from "../../../store/actions/profile";
import { useSelector } from 'react-redux';
import logo from '../../../assets/images/shared/logo.png';

const Logo = ({width, height}) => {
    const profile = useSelector(state => state.profile);
    const videoTrack =  useSelector((state) => state.localTrack).find(track=>track?.isVideoTrack());

const useStyles = makeStyles(()=>({
  logo: {
    display: 'flex',
      textDecoration: 'none',
      color: color.white,
      alignItems: 'center',
      justifyContent: 'center',
      "&:hover": {
          textDecoration: 'none',
          color: color.white,
      }
  },
  logoImage: {
    width: width,
    height: height,
  },
  logoText: {
    fontFamily: `'DM Sans', sans-serif`,
    width: 'fit-content',
    height: "63px",
    display: "flex",
    alignItems: "center",
    color: `${color.white}`,
    fontSize: '1.2rem'
  },
  }))
  
    const classes = useStyles();
    
    return (
        <Box className={classes.logo}>
          
              <img src={logo} alt="logo" className={classes.logoImage}/>
        </Box>
    )
}

export default Logo
