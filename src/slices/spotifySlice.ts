// create asyncThunk to grab Spofity data and format it
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GenericObject } from "../types";

interface fetchTopTracksType{
    timeRange?:string;
    numOfTracks?:number;
}

interface SpofityState {
    isLoggedIn:boolean;
    isLoading:boolean;
    showGraph:boolean;
    tracks:GenericObject[];
    currentAlbum:number,
}

const fetchTopTracks = createAsyncThunk(
    'spotifyAPI/fetchTopTracks',
    async ({timeRange = 'medium_term',numOfTracks = 20}:fetchTopTracksType) => {
        const tracks:GenericObject[] = []; 
        const accessToken:any = window.location.href.match(/access_token=([^&]*)/); 
        
        const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${numOfTracks}`, {
            headers: {
                Authorization: `Bearer ${accessToken[1]}`,
            },
        })

        const tracksResponse = await response.json();
        const makeShortName = (trackTitle:string) => {
            if(trackTitle.length > 20){
                 const shortTitle = trackTitle.slice(0,20);
                 return shortTitle.trim() + '...';
            } else{
                return trackTitle;
            }
        }
        const trackIDs = tracksResponse.items.map((item:GenericObject) => item.id);
        
        
        const audioFeaturesFetch = await fetch(`https://api.spotify.com/v1/audio-features?ids=${trackIDs.join()}`, {
                headers: {
                    Authorization: `Bearer ${accessToken[1]}`,
                },
            })
        const audioFeatruresResponse = await audioFeaturesFetch.json();
        const audioFeatures = audioFeatruresResponse.audio_features;

        const tracksFetch = await fetch(`https://api.spotify.com/v1/tracks?ids=${trackIDs.join()}`, {
                headers: {
                    Authorization: `Bearer ${accessToken[1]}`,
                },
            })
        const tracksFetchResponse = await tracksFetch.json();
        const tracksInfo = tracksFetchResponse.tracks;
        
                
        

        for (let i = 0; i< tracksResponse.items.length; i++) {
            const track = tracksResponse.items[i];
            
            tracks.push({
                name:track.name,
                id:track.id,
                albumName:tracksInfo[i].album.name,
                albumImage:tracksInfo[i].album.images[1].url,
                artistsNames:track.artists.map((artist:GenericObject) => artist.name).join(", "),
                shortName:makeShortName(track.name),
                acousticness:Math.round(audioFeatures[i].acousticness * 100),
                danceability:Math.round(audioFeatures[i].danceability * 100),
                energy:Math.round(audioFeatures[i].energy * 100),
                loudness:Math.round((audioFeatures[i].loudness + 60) * (100/60)),
                valence:Math.round(audioFeatures[i].valence * 100),
            })
        }
        
        
        return tracks;
    }
)

const fetchTopAlbum = createAsyncThunk(
    'spotifyAPI/fetchTopAlbum',
   async (id:string) => {
    const accessToken:any = window.location.href.match(/access_token=([^&]*)/);
    const response = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
            headers: {
                Authorization: `Bearer ${accessToken[1]}`,
            },
        })

        const track = await response.json();
        return track.album.images[1].url;
   }
)

const initialState = {
    isLoggedIn:false,
    isLoading:false,
    showGraph:false,
    tracks:[],
    currentAlbum:0,
} as SpofityState;

const spotifySlice = createSlice({
    name:'spotifyAPI',
    initialState,
    reducers:{
        setIsLoggedIn(state,action) {
            state.isLoggedIn = action.payload;
        },
        setShowGraph(state,action) {
            state.showGraph = action.payload;
        },
        nextAlbum(state){
            state.currentAlbum++;
        },
        prevAlbum(state){
            state.currentAlbum--;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTopTracks.fulfilled, (state, action) => {
                state.tracks = [...action.payload];
                state.isLoading = false;
            })
            .addCase(fetchTopTracks.pending, (state,action) => {
                state.isLoading = true;
            })
            
    }
})
// async thunk exports
export {fetchTopTracks,fetchTopAlbum};

// states
export const selectIsLoggedIn = (state: { spotifyAPI: { isLoggedIn: boolean; }; }) => state.spotifyAPI.isLoggedIn; 
export const selectLoading = (state: { spotifyAPI: { isLoading: boolean; }; }) => state.spotifyAPI.isLoading;
export const selectTracks = (state: { spotifyAPI: { tracks: GenericObject[]; }; }) => state.spotifyAPI.tracks;
export const selectCurrentAlbum = (state: { spotifyAPI: { currentAlbum: number; }; }) => state.spotifyAPI.currentAlbum;
export const selectShowGraph = (state: { spotifyAPI: { showGraph: boolean; }; }) => state.spotifyAPI.showGraph; 

export const {setIsLoggedIn,setShowGraph,nextAlbum,prevAlbum} = spotifySlice.actions;
export default spotifySlice.reducer;