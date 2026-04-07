import './Scatterplot.css'
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedCommunities } from '../../redux/DataSetSlice';

import ScatterplotD3 from './Scatterplot-d3';

function ScatterplotContainer({ xAttributeName, yAttributeName }) {
    const visData = useSelector(state => state.dataSet.dataSet);           
    const selectedCommunities = useSelector(state => state.dataSet.selectedCommunities || []); 
    const dispatch = useDispatch();   

    const divContainerRef = useRef(null);
    const scatterplotD3Ref = useRef(null);

    /**
     * Get current container size for the chart
     */
    const getChartSize = () => {
        if (!divContainerRef.current) {
            return { width: 800, height: 600 };
        }
        const { offsetWidth, offsetHeight } = divContainerRef.current;
        return { 
            width: offsetWidth || 800, 
            height: offsetHeight || 600 
        };
    };

    // 1. Component did mount → Initialize D3 instance
    useEffect(() => {    
        const scatterplotD3 = new ScatterplotD3(divContainerRef.current);
        scatterplotD3.create({ size: getChartSize() });
        
        scatterplotD3Ref.current = scatterplotD3;

        return () => {
            scatterplotD3Ref.current?.clear();
        };
    }, []);

    // 2. Re-render scatterplot whenever data or selection changes
    useEffect(() => {
        const scatterplotD3 = scatterplotD3Ref.current;
        if (!scatterplotD3 || !visData || visData.length === 0) return;

        const handleOnClick = (itemData) => { };

        const handleBrushSelection = (selectedItems) => {
            dispatch(setSelectedCommunities(selectedItems));   // Update Redux
        };

        const controllerMethods = {
            handleOnClick,
            handleBrushSelection,
            handleOnMouseEnter: () => {},
            handleOnMouseLeave: () => {}
        };

        scatterplotD3.renderScatterplot(
            visData,
            xAttributeName,
            yAttributeName,
            controllerMethods,
            selectedCommunities
        );
    }, [visData, xAttributeName, yAttributeName, selectedCommunities, dispatch]);

    return (
        <div 
            ref={divContainerRef} 
            className="scatterplotDivContainer col"
            style={{
                height: "600px",
                width: "100%",
                border: "1px solid #ccc",
                position: "relative",
                backgroundColor: "#fafafa"
            }}
        >
            {(!visData || visData.length === 0) && (
                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    color: "#666",
                    fontSize: "18px",
                    fontWeight: 500,
                    zIndex: 10,
                    textAlign: "center",
                    pointerEvents: "none"
                }}>
                    Loading data...<br />
                    <small style={{ 
                        fontSize: "14px", 
                        color: "#999", 
                        marginTop: "8px", 
                        display: "block" 
                    }}>
                        Please wait while the dataset is loaded
                    </small>
                </div>
            )}
        </div>
    );
}

export default ScatterplotContainer;