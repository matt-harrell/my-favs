import { Grid, LinearProgress } from "@mui/material";
import { useEffect } from "react";
import { useDispatch,useSelector } from "react-redux";
import { AppDispatch } from "../app/store";
import { selectNumOfTracks, selectTimeRange } from "../features/filterButtonsSlice";
import { fetchTopTracks, selectLoading } from "../features/spotifySlice";
import Histogram from "./Histogram";
import NumOfTrackSlider from "./NumOfTrackSlider/NumNumOfTrackSlider";
import TimeRangeButtons from "./TimeRangeButtons/TimeRangeButtons";

const LoggedInScreen = () => {

    const dispatch = useDispatch<AppDispatch>();
    const timeRange = useSelector(selectTimeRange);
    const numOfTracks = useSelector(selectNumOfTracks);
    const loading = useSelector(selectLoading);
    
    // handles deplaying api called based on filtered button change
    useEffect(() => {
        // time out prevents too many API calls
        const delayChange = setTimeout(() => {
            dispatch(fetchTopTracks({timeRange,numOfTracks}))
        }, 500);
        return () => clearTimeout(delayChange);
    },[dispatch,timeRange,numOfTracks]);

    return(
        <Grid container spacing={2} marginTop={1}>
            <Grid item xs={12} md={6}>
                <TimeRangeButtons/>
            </Grid>
            <Grid item xs={12} md={6}>
                <NumOfTrackSlider/>
            </Grid>
            <Grid item xs={12}>
                {loading ? <LinearProgress /> : <Histogram/>}
            </Grid>
        </Grid>
    );
}

export default LoggedInScreen;