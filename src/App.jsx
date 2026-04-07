import './App.css';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ScatterplotContainer from './components/scatterplot/ScatterplotContainer';
import HierarchyContainer from './components/hierarchy/HierarchyContainer';
import { getDataSet } from './redux/DataSetSlice';

function App() {
    const dispatch = useDispatch();
    const visData = useSelector(state => state.dataSet.dataSet);
    const selectedCommunities = useSelector(state => state.dataSet.selectedCommunities || []);

    useEffect(() => {
        console.log("App: Dispatching getDataSet...");
        dispatch(getDataSet());
    }, [dispatch]);


    // Calculate the statistics of selected information
    const selectedCount = selectedCommunities.length;
    const uniqueStates = [...new Set(selectedCommunities.map(d => d.state))].length;

    const avgCrimes = selectedCount > 0 
        ? (selectedCommunities.reduce((sum, d) => sum + (Number(d.ViolentCrimesPerPop) || 0), 0) / selectedCount).toFixed(3)
        : "—";
    const avgIncome = selectedCount > 0 
        ? (selectedCommunities.reduce((sum, d) => sum + (Number(d.medIncome) || 0), 0) / selectedCount).toFixed(3)
        : "—";

    return (
        <div className="App">
            <div style={{
                padding: "15px 20px",
                backgroundColor: "#f8f9fa",
                borderBottom: "2px solid #ddd",
                marginBottom: "10px",
                fontSize: "16px",
                display: "flex",
                gap: "30px",
                alignItems: "center",
                flexWrap: "wrap"
            }}>
                <div>
                    <strong>Selected:</strong> 
                    <span style={{color: "#d32f2f", fontSize: "20px"}}>{selectedCount}</span> communities
                </div>
                
                {selectedCount > 0 && (
                    <>
                        <div><strong>States:</strong> {uniqueStates}</div>
                        <div><strong>Avg ViolentCrimesPerPop:</strong> {avgCrimes}</div>
                        <div><strong>Avg medIncome:</strong> {avgIncome}</div>
                    </>
                )}

                {selectedCount === 0 && (
                    <div style={{color: "#666", fontStyle: "italic"}}>
                        Brush on scatterplot or click on Treemap to select communities
                    </div>
                )}
            </div>

            <div 
                id="MultiviewContainer" 
                className="row"
                style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "20px",
                    padding: "20px",
                    justifyContent: "flex-start"
                }}
            >
                <div style={{ flex: "1", minWidth: "600px" }}>
                    <ScatterplotContainer 
                        xAttributeName="medIncome"
                        yAttributeName="ViolentCrimesPerPop"
                    />
                </div>

                <div style={{ flex: "1", minWidth: "600px" }}>
                    <HierarchyContainer />
                </div>
            </div>
        </div>
    );
}

export default App;