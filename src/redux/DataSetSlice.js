import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import Papa from "papaparse"

export const getDataSet = createAsyncThunk('communities/fetchData', async (args, thunkAPI) => {
  try{
    const response = await fetch('data/communities.csv');
    const responseText = await response.text();
    console.log("loaded file length:" + responseText.length);
    const responseJson = Papa.parse(responseText,{header:true, dynamicTyping:true});

    const cleanedData = responseJson.data
      .map((item, i) => {
        const cleaned = { ...item, index: i };
        Object.keys(cleaned).forEach(key => {
          if (cleaned[key] === "?") cleaned[key] = null;
          else if (typeof cleaned[key] === 'string' && cleaned[key].trim() !== '' && !isNaN(cleaned[key])) {
            cleaned[key] = Number(cleaned[key]);
          }
        });
        return cleaned;
      })
      .filter(item => {
        const x = item.medIncome;
        const y = item.ViolentCrimesPerPop;
        return x != null && y != null && !isNaN(x) && !isNaN(y);
      });

    return cleanedData;
  }catch(error){
    console.error("error catched in asyncThunk" + error);
    return thunkAPI.rejectWithValue(error)
  }
})

export const dataSetSlice = createSlice({
  name: 'dataSet',
  initialState: {
    dataSet: [],
    selectedCommunities: []          
  },
  reducers: {
    setSelectedCommunities: (state, action) => {
      state.selectedCommunities = Array.isArray(action.payload) ? action.payload : [];
      console.log("Redux updated selectedCommunities:", state.selectedCommunities.length, "items");
    }
  },
  extraReducers: builder => {
    builder.addCase(getDataSet.pending, (state) => {
      console.log("extraReducer getDataSet.pending");
    })
    builder.addCase(getDataSet.fulfilled, (state, action) => {
      state.dataSet = action.payload;
      console.log("Data loaded successfully, total items:", action.payload.length);
    })
    builder.addCase(getDataSet.rejected, (state, action) => {
      console.log("extraReducer getDataSet.rejected");
    })
  }
})

export const { setSelectedCommunities } = dataSetSlice.actions;

export default dataSetSlice.reducer;